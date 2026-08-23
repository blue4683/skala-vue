export const TUNING = {
  WIND_MAX: 15, // m/s — 이 값에서 드리프트 최대
  GUST_MAX: 8, // m/s — 돌풍 차이 정규화 기준
  RAIN_MAX: 10, // mm/h
  SNOW_MAX: 5, // mm/h
  VISIBILITY_CAP: 10000, // m — API 최대값(캡)
  BLUR_MAX: 12, // px
  HUMIDITY_HAZE_FROM: 60, // % — 이 아래는 헤이즈 없음
  PARTICLE_MAX: 400, // 최대 파티클 수
}

export const SKY = {
  day: ['#7FB2E5', '#C9DFF2'],
  goldenHour: ['#E8934A', '#F2C879'],
  twilight: ['#3E4A78', '#8A6E9B'],
  night: ['#0F1830', '#1E2A4A'],
  polarDay: ['#8FA8C8', '#D6E2EE'],
  polarNight: ['#0B1224', '#16203A'],
}

/**
 * @param {number} altitude
 * @param {boolean} isNight
 * @returns {[string, string]}
 */
export function pickSky(altitude, isNight) {
  if (isNight) return altitude > 0.15 ? SKY.twilight : SKY.night
  if (altitude < 0.15) return SKY.goldenHour
  return SKY.day
}
