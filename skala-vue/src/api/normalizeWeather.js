// /data/2.5/weather 응답 → 내부 OneCallResponse(types/weather.js) 모양으로 변환.
// One Call 3.0은 유료 구독(One Call by Call)이 필요해 무료 엔드포인트를 쓰는 대신,
// 이 어댑터 하나로 나머지 composables는 원래 타입 그대로 사용한다.

/**
 * @param {object} raw - /data/2.5/weather 원본 응답
 * @returns {import('@/types/weather').OneCallResponse}
 */
export function normalizeCurrentWeather(raw) {
  return {
    lat: raw.coord?.lat,
    lon: raw.coord?.lon,
    timezone: raw.name ?? '',
    timezone_offset: raw.timezone ?? 0,
    data: [
      {
        dt: raw.dt,
        sunrise: raw.sys?.sunrise,
        sunset: raw.sys?.sunset,
        temp: raw.main?.temp,
        feels_like: raw.main?.feels_like,
        pressure: raw.main?.pressure,
        humidity: raw.main?.humidity,
        dew_point: 0, // 2.5/weather는 이슬점을 주지 않음. ObservationParams에서도 쓰지 않아 미사용.
        clouds: raw.clouds?.all ?? 0,
        uvi: 0, // 2.5/weather는 UV 지수를 주지 않음(One Call 전용). 극지방 백야/극야 판별 정확도에 영향 — 알려진 한계.
        visibility: raw.visibility ?? 10000,
        wind_speed: raw.wind?.speed ?? 0,
        wind_gust: raw.wind?.gust,
        wind_deg: raw.wind?.deg ?? 0,
        rain: raw.rain,
        snow: raw.snow,
        weather: raw.weather,
      },
    ],
  }
}
