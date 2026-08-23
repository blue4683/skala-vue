import { ref } from 'vue'
import stargazingSitesData from '@/data/stargazingSites.json'
import { useAstronomy } from '@/composables/useAstronomy'
import { evaluateSiteAt } from '@/composables/useObservationScore'
import { findBestWindow } from '@/utils/observationScore'

const HOUR_MS = 3_600_000
// 대한민국 대략 중심(충북 인근). "오늘 밤" 시간 리본의 항해박명 경계를 구하는 데만 쓰며,
// 실제 각 후보지의 태양 고도는 evaluateSiteAt에서 그 장소 좌표로 다시 계산한다.
const KOREA_CENTER = { latitude: 36.5, longitude: 127.8 }

export function useStargazingSites() {
  const { makeObserver, nightWindow } = useAstronomy()
  const sites = ref(stargazingSitesData.sites)

  /**
   * "오늘 밤"(항해박명 시작~종료)을 1시간 간격으로 나눈 시각 목록.
   * @param {Date} [now]
   * @returns {Date[]}
   */
  function buildTonightSlots(now = new Date()) {
    const observer = makeObserver(KOREA_CENTER.latitude, KOREA_CENTER.longitude)
    const window = nightWindow(now, observer)
    if (!window) return []

    const start = Math.ceil(window.duskMs / HOUR_MS) * HOUR_MS
    const end = Math.floor(window.dawnMs / HOUR_MS) * HOUR_MS
    const slots = []
    for (let t = start; t <= end; t += HOUR_MS) slots.push(new Date(t))
    return slots
  }

  /**
   * 지도 마커용 — 모든 후보지의 특정 시각 기준 점수를 계산한다.
   * @param {Date} date
   */
  function scoresAt(date) {
    return sites.value.map((site) => {
      const result = evaluateSiteAt(site, date)
      return {
        id: site.id,
        latitude: site.latitude,
        longitude: site.longitude,
        score: result.score,
        status: result.status,
        reason: result.reason,
        factors: result.factors,
      }
    })
  }

  /**
   * 오늘 밤 전체 후보지 중 가장 좋은 관측 시간대를 찾아 그 시작 시각을 반환한다.
   * 후보지가 하나도 80점 이상 구간을 갖지 못하면 오늘 밤 첫 시각으로 대체한다.
   */
  function defaultBestTime(now = new Date()) {
    const slots = buildTonightSlots(now)
    if (!slots.length) return now

    let best = null
    for (const site of sites.value) {
      const hourly = slots.map((t) => ({ time: t.getTime(), score: evaluateSiteAt(site, t).score }))
      const window = findBestWindow(hourly)
      if (window && (!best || window.averageScore > best.averageScore)) best = window
    }
    return best ? new Date(best.start) : slots[0]
  }

  return { sites, buildTonightSlots, scoresAt, defaultBestTime }
}
