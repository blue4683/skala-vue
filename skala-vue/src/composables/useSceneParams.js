import { computed } from 'vue'
import { TUNING } from '@/constants/sceneTuning'

const clamp01 = (n) => Math.min(1, Math.max(0, n))

/** @type {import('@/types/scene').ObservationParams} */
const DEFAULT_OBS = {
  cloudDensity: 0,
  driftX: 0,
  driftSpeed: 0,
  gustAmplitude: 0,
  rainRate: 0,
  snowRate: 0,
  blurPx: 0,
  hazeOpacity: 0,
  condition: 800,
}

/**
 * @param {import('@/types/weather').CurrentData} d
 * @returns {import('@/types/scene').ObservationParams}
 */
export function toObservation(d) {
  // wind_deg는 '불어오는' 방향(기상학 관례).
  // 표준 공식 u = -sin(θ) 로 동서 성분을 뽑는다. (+u = 동쪽으로 흐름)
  const rad = (d.wind_deg * Math.PI) / 180
  const u = -Math.sin(rad)

  return {
    cloudDensity: d.clouds / 100,
    driftX: u,
    driftSpeed: clamp01(d.wind_speed / TUNING.WIND_MAX),
    gustAmplitude: clamp01(((d.wind_gust ?? d.wind_speed) - d.wind_speed) / TUNING.GUST_MAX),
    rainRate: clamp01((d.rain?.['1h'] ?? 0) / TUNING.RAIN_MAX),
    snowRate: clamp01((d.snow?.['1h'] ?? 0) / TUNING.SNOW_MAX),
    blurPx: (1 - clamp01(d.visibility / TUNING.VISIBILITY_CAP)) * TUNING.BLUR_MAX,
    hazeOpacity: Math.max(0, (d.humidity - TUNING.HUMIDITY_HAZE_FROM) / 100),
    condition: d.weather[0].id,
  }
}

/**
 * @param {import('vue').Ref<import('@/types/weather').CurrentData|null>} data
 * @param {import('vue').Ref<import('@/types/scene').TimeParams>} time
 * @returns {import('vue').ComputedRef<import('@/types/scene').SceneParams>}
 */
export function useSceneParams(data, time) {
  return computed(() => ({
    ...(data.value ? toObservation(data.value) : DEFAULT_OBS),
    ...time.value,
  }))
}
