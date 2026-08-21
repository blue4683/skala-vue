import { ref } from 'vue'
import { buildMockForecast } from '@/mocks/kma/forecast'

const HOUR_MS = 3_600_000
const SLOT_STEP_HOURS = 3
const HORIZON_HOURS = 48

function buildTimeSlots(now = Date.now()) {
  const start = Math.floor(now / HOUR_MS) * HOUR_MS
  const count = HORIZON_HOURS / SLOT_STEP_HOURS + 1
  return Array.from({ length: count }, (_, i) => start + i * SLOT_STEP_HOURS * HOUR_MS)
}

/**
 * 해안 구간 목록 + 격자별 예보를 로드한다.
 * 격자 dedupe → (mock) 병렬 조회 → 구간별 시각 인덱스 접근 함수를 제공한다.
 * 근거: coastal-map-design.md §4.4, §6.2
 */
export function useCoastalData() {
  const segments = ref([])
  const loading = ref(false)
  const error = ref(null)
  const timeSlots = buildTimeSlots()

  let forecastByGrid = new Map()

  async function load() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}map/segments.json`)
      if (!res.ok) throw new Error(`구간 정보를 불러오지 못했습니다 (${res.status})`)
      segments.value = await res.json()

      const uniqueGrids = [
        ...new Map(segments.value.map((s) => [`${s.grid.nx},${s.grid.ny}`, s.grid])).values(),
      ]
      // 실 API 키가 없어 목업으로 대체 (coastal-map-design.md §7 1단계 승인 대기)
      forecastByGrid = buildMockForecast(uniqueGrids, timeSlots)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '알 수 없는 오류'
    } finally {
      loading.value = false
    }
  }

  /**
   * @param {{grid: {nx: number, ny: number}}} segment
   * @param {number} timeIndex timeSlots의 인덱스
   * @returns {object|null}
   */
  function forecastOf(segment, timeIndex) {
    const rows = forecastByGrid.get(`${segment.grid.nx},${segment.grid.ny}`)
    return rows?.[timeIndex] ?? null
  }

  return { segments, timeSlots, loading, error, load, forecastOf }
}
