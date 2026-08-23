import axios from 'axios'

const BASE = 'https://api.open-meteo.com/v1/forecast'
const HOURLY = [
  'temperature_2m',
  'precipitation',
  'cloud_cover',
  'cloud_cover_low',
  'visibility',
  'wind_speed_10m',
]
const CACHE_KEY = 'stargazing-weather-v1'
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
    source,
  }
}

export async function fetchStargazingWeather(sites) {
  const cached = readCache(sites)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cachedResult(cached, 'cache')
  }
  if (pendingRequest) return pendingRequest

  pendingRequest = axios
    .get(BASE, {
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
    .then((response) => {
      const values = Array.isArray(response.data) ? response.data : [response.data]
      const cache = {
        signature: cacheSignature(sites),
        fetchedAt: Date.now(),
        forecasts: Object.fromEntries(sites.map((site, index) => [site.id, values[index]])),
      }
      writeCache(cache)
      return cachedResult(cache, 'live')
    })
    .catch((error) => {
      if (error?.response?.status === 429) {
        if (cached) return cachedResult(cached, 'stale-cache')
        throw new Error('Open-Meteo 요청 한도를 초과했고 저장된 예보가 없습니다.', {
          cause: error,
        })
      }
      throw error
    })
    .finally(() => {
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
    temperatureC: hourly.temperature_2m?.[bestIndex] ?? null,
    precipitationMm: hourly.precipitation?.[bestIndex] ?? null,
    cloudPercent: hourly.cloud_cover?.[bestIndex] ?? null,
    lowCloudPercent: hourly.cloud_cover_low?.[bestIndex] ?? null,
    visibilityM: hourly.visibility?.[bestIndex] ?? null,
    windSpeedMps: hourly.wind_speed_10m?.[bestIndex] ?? null,
  }
}
