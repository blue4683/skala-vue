import { describe, expect, it } from 'vitest'
import { normalizeWeatherSummary, openWeatherConditionFromId } from './normalizeWeather'

describe('normalizeWeatherSummary', () => {
  it('OpenWeather 현재 날씨 응답을 대시보드 모델로 변환한다', () => {
    const raw = {
      dt: 1_800_000_000,
      weather: [{ id: 501, description: '보통 비' }],
      main: { temp: 12, feels_like: 10, humidity: 72, pressure: 1013 },
      rain: { '1h': 0.4 },
      clouds: { all: 65 },
      visibility: 9000,
      wind: { speed: 3.2, deg: 240 },
    }

    expect(normalizeWeatherSummary(raw)).toEqual({
      observedAt: 1_800_000_000_000,
      temperatureC: 12,
      feelsLikeC: 10,
      humidityPercent: 72,
      precipitationMm: 0.4,
      cloudPercent: 65,
      pressureHpa: 1013,
      visibilityM: 9000,
      windSpeedMps: 3.2,
      windDirectionDegrees: 240,
      conditionKey: 'rain',
      conditionLabel: '보통 비',
    })
  })

  it('강수 필드가 없으면 0mm로 처리하고 선택 필드가 없으면 null을 유지한다', () => {
    expect(normalizeWeatherSummary({ weather: [{ id: 800 }] })).toMatchObject({
      precipitationMm: 0,
      visibilityM: null,
      windDirectionDegrees: null,
      conditionKey: 'clear',
      conditionLabel: '맑음',
    })
  })
})

describe('openWeatherConditionFromId', () => {
  it.each([
    [200, 'thunderstorm'],
    [301, 'drizzle'],
    [501, 'rain'],
    [601, 'snow'],
    [741, 'fog'],
    [800, 'clear'],
    [801, 'partly-cloudy'],
    [804, 'cloudy'],
  ])('OpenWeather 상태 코드 %i를 %s 상태로 변환한다', (id, key) => {
    expect(openWeatherConditionFromId(id).key).toBe(key)
  })
})
