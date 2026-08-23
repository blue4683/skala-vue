import axios from 'axios'

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast'
const OPEN_WEATHER_BASE = 'https://api.openweathermap.org/data/2.5/forecast'
const HOURLY = [
  'temperature_2m',
  'precipitation',
  'cloud_cover',
  'cloud_cover_low',
  'visibility',
  'wind_speed_10m',
]
const CACHE_KEY = 'stargazing-weather-v2'
const CACHE_TTL_MS = 30 * 60 * 1000
let pendingRequest = null

function cacheSignature(sites) {
  return sites
    .map((site) => `${site.id}:${site.latitude}:${site.longitude}:${site.elevationM ?? 'nan'}`)
    .join('|')
}

function getStorage() {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

function readCache(sites) {
  try {
    const cached = JSON.parse(getStorage()?.getItem(CACHE_KEY) ?? 'null')
    if (
      !cached ||
      cached.signature !== cacheSignature(sites) ||
      !Number.isFinite(cached.fetchedAt) ||
      !cached.forecasts ||
      typeof cached.forecasts !== 'object'
    ) {
      return null
    }
    return cached
  } catch {
    return null
  }
}

function writeCache(cache) {
  try {
    getStorage()?.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // 저장 공간이 없거나 비활성화돼도 실시간 조회 결과는 그대로 사용한다.
  }
}

function cachedResult(cache, source) {
  return {
    forecasts: cache.forecasts,
    fetchedAt: cache.fetchedAt,
    provider: cache.provider,
    source,
  }
}

function cacheForecasts(sites, forecasts, provider) {
  const cache = {
    signature: cacheSignature(sites),
    fetchedAt: Date.now(),
    forecasts,
    provider,
  }
  writeCache(cache)
  return cachedResult(cache, 'live')
}

async function fetchOpenMeteoForecasts(sites) {
  const response = await axios.get(OPEN_METEO_BASE, {
    params: {
      latitude: sites.map((site) => site.latitude).join(','),
      longitude: sites.map((site) => site.longitude).join(','),
      elevation: sites.map((site) => site.elevationM ?? 'nan').join(','),
      hourly: HOURLY.join(','),
      wind_speed_unit: 'ms',
      timeformat: 'unixtime',
      timezone: 'GMT',
      past_days: 1,
      forecast_days: 8,
    },
  })
  const values = Array.isArray(response.data) ? response.data : [response.data]
  return Object.fromEntries(
    sites.map((site, index) => [site.id, { ...values[index], provider: 'open-meteo' }]),
  )
}

function normalizeOpenWeatherForecast(raw) {
  const rows = raw.list ?? []
  return {
    provider: 'openweather',
    hourly: {
      time: rows.map((row) => row.dt),
      temperature_2m: rows.map((row) => row.main?.temp ?? null),
      precipitation: rows.map(
        (row) => row.rain?.['3h'] ?? row.snow?.['3h'] ?? row.rain?.['1h'] ?? row.snow?.['1h'] ?? 0,
      ),
      cloud_cover: rows.map((row) => row.clouds?.all ?? null),
      visibility: rows.map((row) => row.visibility ?? null),
      wind_speed_10m: rows.map((row) => row.wind?.speed ?? null),
    },
  }
}

async function fetchOpenWeatherForecasts(sites) {
  const apiKey = import.meta.env.VITE_OWM_API_KEY
  if (!apiKey) throw new Error('OpenWeather API 키(VITE_OWM_API_KEY)가 설정되지 않았습니다.')

  const responses = await Promise.all(
    sites.map((site) =>
      axios.get(OPEN_WEATHER_BASE, {
        params: {
          lat: site.latitude,
          lon: site.longitude,
          units: 'metric',
          appid: apiKey,
        },
      }),
    ),
  )
  return Object.fromEntries(
    sites.map((site, index) => [site.id, normalizeOpenWeatherForecast(responses[index].data)]),
  )
}

export async function fetchStargazingWeather(sites) {
  const cached = readCache(sites)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cachedResult(cached, 'cache')
  }
  if (pendingRequest) return pendingRequest

  pendingRequest = (async () => {
    try {
      const forecasts = await fetchOpenMeteoForecasts(sites)
      return cacheForecasts(sites, forecasts, 'open-meteo')
    } catch {
      try {
        const forecasts = await fetchOpenWeatherForecasts(sites)
        return cacheForecasts(sites, forecasts, 'openweather')
      } catch (openWeatherError) {
        if (cached) return cachedResult(cached, 'stale-cache')
        throw new Error('Open-Meteo와 OpenWeather 예보를 모두 불러오지 못했습니다.', {
          cause: openWeatherError,
        })
      }
    }
  })().finally(() => {
    pendingRequest = null
  })

  return pendingRequest
}

function closestHourlyIndex(forecast, date) {
  const times = forecast?.hourly?.time
  if (!times?.length) return -1

  const targetSeconds = date.getTime() / 1000
  let bestIndex = 0
  for (let index = 1; index < times.length; index++) {
    if (Math.abs(times[index] - targetSeconds) < Math.abs(times[bestIndex] - targetSeconds)) {
      bestIndex = index
    }
  }

  return Math.abs(times[bestIndex] - targetSeconds) <= 90 * 60 ? bestIndex : -1
}

export function weatherAt(forecast, date) {
  const bestIndex = closestHourlyIndex(forecast, date)
  if (bestIndex < 0) return null

  const hourly = forecast.hourly
  return {
    provider: forecast.provider ?? 'open-meteo',
    temperatureC: hourly.temperature_2m?.[bestIndex] ?? null,
    precipitationMm: hourly.precipitation?.[bestIndex] ?? null,
    cloudPercent: hourly.cloud_cover?.[bestIndex] ?? null,
    lowCloudPercent: hourly.cloud_cover_low?.[bestIndex] ?? null,
    visibilityM: hourly.visibility?.[bestIndex] ?? null,
    windSpeedMps: hourly.wind_speed_10m?.[bestIndex] ?? null,
  }
}
