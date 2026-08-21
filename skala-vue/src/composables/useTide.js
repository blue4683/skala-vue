import { ref, computed } from 'vue'
import { fetchTidePreTab, normalizeTideResponse } from '@/api/khoaTide'
import { tideLevelAt, buildTideSeries, tideExtent } from '@/utils/tideCurve'

const DAY_MS = 86_400_000

function startOfDay(ms) {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function formatYYYYMMDD(ms) {
  const d = new Date(ms)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

export function useTide() {
  const extrema = ref([])
  const loading = ref(false)
  const error = ref(null)

  const rangeStart = startOfDay(Date.now())
  const rangeEnd = rangeStart + DAY_MS

  /**
   * 전날/당일/다음날 3일치를 이어붙여 자정 경계 문제를 해결한다 (설계서 §3 boxed note).
   * @param {string} obsCode
   */
  async function load(obsCode) {
    loading.value = true
    error.value = null
    try {
      const dateStrs = [-1, 0, 1].map((d) => formatYYYYMMDD(rangeStart + d * DAY_MS))
      const results = await Promise.all(dateStrs.map((d) => fetchTidePreTab(obsCode, d)))
      extrema.value = results.flat().sort((a, b) => a.time - b.time)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '알 수 없는 오류'
    } finally {
      loading.value = false
    }
  }

  /**
   * KHOA 인증키 없이, 원본 응답 형태의 mock(전날/당일/다음날) 3개를 정규화해 이어붙인다.
   * @param {object[]} rawDays
   */
  function loadMock(rawDays) {
    error.value = null
    extrema.value = rawDays.flatMap(normalizeTideResponse).sort((a, b) => a.time - b.time)
  }

  const series = computed(() =>
    extrema.value.length ? buildTideSeries(extrema.value, rangeStart, rangeEnd) : [],
  )

  const tidalRange = computed(() => {
    if (!series.value.length) return 0
    const levels = series.value.map((p) => p.level)
    return Math.max(...levels) - Math.min(...levels)
  })

  function levelAt(t) {
    return tideLevelAt(extrema.value, t)
  }

  /**
   * 0~1 정규화(로딩된 극점 전체 범위 기준 — 스크럽 중에도 스케일이 흔들리지 않는다).
   * 데이터가 없거나 범위 밖이면 중간값(0.5)으로 대체.
   * @param {number} t
   */
  function normalizedLevelAt(t) {
    const { min, max } = tideExtent(extrema.value)
    const level = levelAt(t)
    if (level === null || max === min) return 0.5
    return (level - min) / (max - min)
  }

  return {
    extrema,
    series,
    tidalRange,
    loading,
    error,
    load,
    loadMock,
    levelAt,
    normalizedLevelAt,
    rangeStart,
    rangeEnd,
  }
}
