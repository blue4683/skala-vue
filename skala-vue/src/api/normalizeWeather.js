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

export function openWeatherConditionFromId(id) {
  if (id >= 200 && id < 300) return { key: 'thunderstorm', label: '뇌우' }
  if (id >= 300 && id < 400) return { key: 'drizzle', label: '이슬비' }
  if (id >= 500 && id < 600) return { key: 'rain', label: '비' }
  if (id >= 600 && id < 700) return { key: 'snow', label: '눈' }
  if (id >= 700 && id < 800) return { key: 'fog', label: '안개·대기 현상' }
  if (id === 800) return { key: 'clear', label: '맑음' }
  if (id === 801) return { key: 'partly-cloudy', label: '구름 조금' }
  if (id > 801 && id < 900) return { key: 'cloudy', label: '흐림' }
  return { key: 'unknown', label: '정보 없음' }
}

export function normalizeWeatherSummary(raw) {
  const primaryCondition = raw.weather?.[0] ?? {}
  const condition = openWeatherConditionFromId(primaryCondition.id)

  return {
    observedAt: raw.dt != null ? raw.dt * 1000 : null,
    temperatureC: raw.main?.temp ?? null,
    feelsLikeC: raw.main?.feels_like ?? null,
    humidityPercent: raw.main?.humidity ?? null,
    precipitationMm: raw.rain?.['1h'] ?? raw.snow?.['1h'] ?? 0,
    cloudPercent: raw.clouds?.all ?? null,
    pressureHpa: raw.main?.pressure ?? null,
    visibilityM: raw.visibility ?? null,
    windSpeedMps: raw.wind?.speed ?? null,
    windDirectionDegrees: raw.wind?.deg ?? null,
    conditionKey: condition.key,
    conditionLabel: primaryCondition.description ?? condition.label,
  }
}
