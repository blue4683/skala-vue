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

export async function fetchStargazingWeather(sites) {
  const response = await axios.get(BASE, {
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

  const forecasts = Array.isArray(response.data) ? response.data : [response.data]
  return Object.fromEntries(sites.map((site, index) => [site.id, forecasts[index]]))
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
