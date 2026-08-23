import { computed, unref } from 'vue'
import { useAstronomy } from '@/composables/useAstronomy'
import constellationsData from '@/data/constellations.json'
import {
  checkHardGate,
  darknessScoreFrom,
  cloudScoreFrom,
  openWeatherCloudScoreFrom,
  moonScoreFrom,
  visibilityScoreFrom,
  comfortScoreFrom,
  computeScore,
} from '@/utils/observationScore'
import { evaluateConstellations } from '@/utils/constellationVisibility'

const { makeObserver, sunAltitude, moonInfo, starAltAz } = useAstronomy()

/**
 * 한 장소·한 시각의 관측 조건을 계산한다(순수 계산, Vue와 무관).
 * @param {object} site
 * @param {Date} date
 * @param {object|null} weather
 */
export function evaluateSiteAt(site, date, weather) {
  const observer = makeObserver(site.latitude, site.longitude, site.elevationM ?? 0)
  const sunAlt = sunAltitude(date, observer)
  const moon = moonInfo(date, observer)

  if (!weather || site.darknessScore == null) {
    return {
      score: null,
      status: 'unavailable',
      reason: '실시간 데이터를 불러오는 중',
      factors: null,
      constellations: [],
    }
  }

  const gate = checkHardGate({
    sunAltitudeDegrees: sunAlt,
    precipitationMm: weather.precipitationMm,
    cloudPercent: weather.cloudPercent,
  })

  const factors = {
    darkness: {
      score: darknessScoreFrom(site.darknessScore),
      bortleEstimate: site.bortleEstimate,
      radianceNanoWatts: site.lightPollution?.radianceNanoWatts ?? null,
    },
    cloud: {
      score:
        weather.provider === 'openweather'
          ? openWeatherCloudScoreFrom(weather.cloudPercent)
          : cloudScoreFrom(weather.cloudPercent, weather.lowCloudPercent),
      totalPercent: weather.cloudPercent,
      lowPercent: weather.provider === 'openweather' ? null : weather.lowCloudPercent,
      provider: weather.provider,
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
export function useObservationScore(site, time, weather) {
  return computed(() => {
    const s = unref(site)
    const t = unref(time)
    const w = unref(weather)
    if (!s) return null
    return { site: s, ...evaluateSiteAt(s, t, w) }
  })
}
