// src/api/normalizeWeather.js
// /data/2.5/weather 응답 → 내부에서 쓸 공통 모양으로 변환.
// 유료 One Call 3.0 대신 무료 엔드포인트를 쓰면서도, 이 어댑터 하나 덕분에
// 나머지 composable/컴포넌트는 원래 타입 그대로 사용한다.

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
        dew_point: 0, // 2.5/weather는 이슬점을 주지 않음 — 미사용
        clouds: raw.clouds?.all ?? 0,
        uvi: 0, // 2.5/weather는 UV 지수를 주지 않음(One Call 전용)
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
