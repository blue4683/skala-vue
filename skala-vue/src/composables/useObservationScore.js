import { computed, unref } from 'vue'
import { useAstronomy } from '@/composables/useAstronomy'
import { mockWeatherAt } from '@/mocks/stargazing/weather'
import constellationsData from '@/data/constellations.json'
import {
  checkHardGate,
  darknessScoreFrom,
  cloudScoreFrom,
  moonScoreFrom,
  visibilityScoreFrom,
  comfortScoreFrom,
  computeScore,
} from '@/utils/observationScore'
import { evaluateConstellations } from '@/utils/constellationVisibility'

const HOUR_MS = 3_600_000
const { makeObserver, sunAltitude, moonInfo, starAltAz } = useAstronomy()

/**
 * 한 장소·한 시각의 관측 조건을 계산한다(순수 계산, Vue와 무관).
 * @param {import('@/data/stargazingSites.json').sites[number]} site
 * @param {Date} date
 */
export function evaluateSiteAt(site, date) {
  const observer = makeObserver(site.latitude, site.longitude, site.elevationM ?? 0)
  const sunAlt = sunAltitude(date, observer)
  const moon = moonInfo(date, observer)

  const timeIndex = Math.round(date.getTime() / HOUR_MS)
  const weather = mockWeatherAt(site.id, timeIndex)

  const gate = checkHardGate({
    sunAltitudeDegrees: sunAlt,
    precipitationMm: weather.precipitationMm,
    cloudPercent: weather.cloudPercent,
  })

  const factors = {
    darkness: { score: darknessScoreFrom(site.darknessScore), bortleEstimate: site.bortleEstimate },
    cloud: {
      score: cloudScoreFrom(weather.cloudPercent, weather.lowCloudPercent),
      totalPercent: weather.cloudPercent,
      lowPercent: weather.lowCloudPercent,
    },
    moon: {
      score: moonScoreFrom({
        illuminationPercent: moon.illuminationPercent,
        altitudeDegrees: moon.altitudeDegrees,
      }),
      illuminationPercent: moon.illuminationPercent,
      altitudeDegrees: Math.round(moon.altitudeDegrees),
    },
    visibility: { score: visibilityScoreFrom(weather.visibilityM), meters: weather.visibilityM },
    comfort: {
      score: comfortScoreFrom({
        windSpeedMps: weather.windSpeedMps,
        temperatureC: weather.temperatureC,
      }),
      windSpeedMps: weather.windSpeedMps,
      temperatureC: weather.temperatureC,
    },
  }

  if (!gate.ok) {
    return { score: null, status: 'unavailable', reason: gate.reason, factors, constellations: [] }
  }

  const score = computeScore({
    darkness: factors.darkness.score,
    cloud: factors.cloud.score,
    moon: factors.moon.score,
    visibility: factors.visibility.score,
    comfort: factors.comfort.score,
  })

  const altAzFor = (raHours, decDegrees) => starAltAz(raHours, decDegrees, date, observer)
  const constellations = evaluateConstellations(constellationsData.constellations, altAzFor, {
    sunAltitudeDegrees: sunAlt,
    moonIlluminationPercent: moon.illuminationPercent,
    moonAltitudeDegrees: moon.altitudeDegrees,
    darknessScore: site.darknessScore,
  })

  const status = score >= 80 ? 'recommended' : 'conditional'
  return { score, status, reason: null, factors, constellations }
}

/**
 * @param {import('vue').Ref<object>|object} site
 * @param {import('vue').Ref<Date>|Date} time
 */
export function useObservationScore(site, time) {
  return computed(() => {
    const s = unref(site)
    const t = unref(time)
    if (!s) return null
    return { site: s, ...evaluateSiteAt(s, t) }
  })
}
