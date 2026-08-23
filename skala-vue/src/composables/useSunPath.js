import { computed } from 'vue'
import { SKY, pickSky } from '@/constants/sceneTuning'

const clamp01 = (n) => Math.min(1, Math.max(0, n))

const FALLBACK = {
  mode: 'normal',
  isNight: false,
  altitude: 0.5,
  bodyX: 0.5,
  progress: 0.5,
  skyStops: SKY.day,
}

export function useSunPath(data, targetMs) {
  return computed(() => {
    const d = data.value
    if (!d) return FALLBACK

    // ── 극지방 분기: 백야/극야에는 sunrise/sunset이 응답에서 빠진다
    if (d.sunrise == null || d.sunset == null) {
      const polarDay = d.uvi > 0
      return {
        mode: polarDay ? 'polar-day' : 'polar-night',
        isNight: !polarDay,
        altitude: polarDay ? 0.18 : 0,
        bodyX: 0.5,
        progress: 0,
        skyStops: polarDay ? SKY.polarDay : SKY.polarNight,
      }
    }

    const t = targetMs.value / 1000
    const rise = d.sunrise
    const set = d.sunset
    const isNight = t < rise || t > set

    // 밤 구간: 다음 일출은 응답에 없으므로 +24h 근사 (한계 명시)
    const [from, to] = isNight ? (t > set ? [set, rise + 86400] : [set - 86400, rise]) : [rise, set]

    const p = clamp01((t - from) / (to - from))
    const altitude = Math.sin(p * Math.PI)

    return {
      mode: 'normal',
      isNight,
      altitude,
      bodyX: p,
      progress: isNight ? 0 : p,
      skyStops: pickSky(altitude, isNight),
    }
  })
}
