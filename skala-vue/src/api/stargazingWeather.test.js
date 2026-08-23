import { describe, expect, it } from 'vitest'
import { weatherAt } from './stargazingWeather'

describe('weatherAt', () => {
  it('가장 가까운 시간의 관측용 날씨를 정규화한다', () => {
    const forecast = {
      hourly: {
        time: [1_800_000_000, 1_800_003_600],
        temperature_2m: [10, 8],
        precipitation: [0, 0.2],
        cloud_cover: [20, 60],
        cloud_cover_low: [5, 30],
        visibility: [12000, 8000],
        wind_speed_10m: [2, 4],
      },
    }

    expect(weatherAt(forecast, new Date(1_800_003_500_000))).toEqual({
      temperatureC: 8,
      precipitationMm: 0.2,
      cloudPercent: 60,
      lowCloudPercent: 30,
      visibilityM: 8000,
      windSpeedMps: 4,
    })
  })

  it('예보 범위를 벗어난 시각에는 null을 반환한다', () => {
    expect(weatherAt({ hourly: { time: [1_800_000_000] } }, new Date(0))).toBeNull()
  })
})
