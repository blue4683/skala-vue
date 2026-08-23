import { computed, ref } from 'vue'
import stargazingCitiesData from '@/data/globalStargazingCities.json'
import { useAstronomy } from '@/composables/useAstronomy'
import { evaluateSiteAt } from '@/composables/useObservationScore'
import { fetchStargazingWeather, weatherAt } from '@/api/stargazingWeather'
import { fetchLightPollution } from '@/api/lightPollution'
import { findBestWindow } from '@/utils/observationScore'

const HOUR_MS = 3_600_000

export function useStargazingSites() {
  const { makeObserver, nightWindow } = useAstronomy()
  const forecasts = ref({})
  const lightPollution = ref({})
  const loading = ref(false)
  const error = ref(null)
  const weatherUpdatedAt = ref(null)
  const weatherSource = ref(null)

  const sites = computed(() =>
    stargazingCitiesData.cities.map((city) => {
      const light = lightPollution.value[city.id]
      return {
        ...city,
        name: city.nameKo,
        region: `${city.region}, ${city.countryCode}`,
        darknessScore: light?.darknessScore ?? null,
        bortleEstimate: null,
        accessNote: `인근 관측 지역: ${city.nearbyObservationArea}`,
        verifiedAt: light?.observedAt?.slice(0, 10) ?? '조회 중',
        lightPollution: light ?? null,
      }
    }),
  )

  async function loadLiveData() {
    loading.value = true
    error.value = null

    const [weatherResult, lightResults] = await Promise.all([
      fetchStargazingWeather(stargazingCitiesData.cities).then(
        (value) => ({ status: 'fulfilled', value }),
        (reason) => ({ status: 'rejected', reason }),
      ),
      Promise.allSettled(stargazingCitiesData.cities.map((city) => fetchLightPollution(city))),
    ])

    if (weatherResult.status === 'fulfilled') {
      forecasts.value = weatherResult.value.forecasts
      weatherUpdatedAt.value = new Date(weatherResult.value.fetchedAt)
      weatherSource.value = weatherResult.value.source
    }

    const nextLight = {}
    lightResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        nextLight[stargazingCitiesData.cities[index].id] = result.value
      }
    })
    lightPollution.value = nextLight

    const failures = [
      weatherResult.status === 'rejected'
        ? weatherResult.reason instanceof Error
          ? weatherResult.reason.message
          : '날씨 데이터를 불러오지 못했습니다.'
        : null,
      lightResults.some((result) => result.status === 'rejected')
        ? '광공해 일부 데이터를 불러오지 못했습니다.'
        : null,
    ].filter(Boolean)
    error.value = failures.length ? failures.join(' ') : null
    loading.value = false
  }

  function weatherFor(site, date) {
    return site ? weatherAt(forecasts.value[site.id], date) : null
  }

  function evaluateAt(site, date) {
    return evaluateSiteAt(site, date, weatherFor(site, date))
  }

  /**
   * "오늘 밤"(항해박명 시작~종료)을 1시간 간격으로 나눈 시각 목록.
   * @param {Date} [now]
   * @returns {Date[]}
   */
  function buildTonightSlots(site, now = new Date()) {
    if (!site) return []
    const observer = makeObserver(site.latitude, site.longitude, site.elevationM ?? 0)
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
      const result = evaluateAt(site, date)
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
   * 지도 비교용 — 각 도시의 오늘 밤 최고 관측 시각을 독립적으로 적용한다.
   * 상세 패널의 시간 선택과 분리해 다른 도시의 마커 값이 함께 바뀌지 않게 한다.
   */
  function scoresAtBestTimes(now = new Date()) {
    return sites.value.map((site) => {
      const result = evaluateAt(site, defaultBestTime(site, now))
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
  function defaultBestTime(site, now = new Date()) {
    const slots = buildTonightSlots(site, now)
    if (!slots.length) return now

    const hourly = slots.map((t) => ({ time: t.getTime(), score: evaluateAt(site, t).score }))
    const best = findBestWindow(hourly)
    return best ? new Date(best.start) : slots[0]
  }

  return {
    sites,
    loading,
    error,
    weatherUpdatedAt,
    weatherSource,
    loadLiveData,
    weatherFor,
    evaluateAt,
    buildTonightSlots,
    scoresAt,
    scoresAtBestTimes,
    defaultBestTime,
  }
}
