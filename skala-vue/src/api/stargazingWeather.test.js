import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import { fetchStargazingWeather, weatherAt } from './stargazingWeather'

vi.mock('axios', () => ({
  default: { get: vi.fn() },
}))

const SITE = {
  id: 'test-site',
  latitude: 37.5,
  longitude: 127,
  elevationM: 100,
}

function createStorage() {
  const values = new Map()
  return {
    getItem: vi.fn((key) => values.get(key) ?? null),
    setItem: vi.fn((key, value) => values.set(key, value)),
    removeItem: vi.fn((key) => values.delete(key)),
    clear: vi.fn(() => values.clear()),
  }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', createStorage())
  axios.get.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

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

describe('fetchStargazingWeather', () => {
  const forecast = { hourly: { time: [1_800_000_000] } }

  it('성공한 예보를 저장하고 30분 안에는 API를 다시 호출하지 않는다', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000)
    axios.get.mockResolvedValue({ data: forecast })

    const live = await fetchStargazingWeather([SITE])
    const cached = await fetchStargazingWeather([SITE])

    expect(live).toMatchObject({ source: 'live', fetchedAt: 1_000_000 })
    expect(cached).toMatchObject({ source: 'cache', fetchedAt: 1_000_000 })
    expect(cached.forecasts[SITE.id]).toEqual(forecast)
    expect(axios.get).toHaveBeenCalledTimes(1)
  })

  it('캐시 만료 후 429가 발생하면 수집 시각을 유지한 저장 예보를 반환한다', async () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(2_000_000)
    axios.get.mockResolvedValueOnce({ data: forecast })
    await fetchStargazingWeather([SITE])

    now.mockReturnValue(2_000_000 + 30 * 60 * 1000 + 1)
    axios.get.mockRejectedValueOnce({ response: { status: 429 } })

    const fallback = await fetchStargazingWeather([SITE])

    expect(fallback).toMatchObject({ source: 'stale-cache', fetchedAt: 2_000_000 })
    expect(fallback.forecasts[SITE.id]).toEqual(forecast)
    expect(axios.get).toHaveBeenCalledTimes(2)
  })

  it('저장된 예보가 없는 429는 원인을 알 수 있는 오류를 반환한다', async () => {
    axios.get.mockRejectedValueOnce({ response: { status: 429 } })

    await expect(fetchStargazingWeather([SITE])).rejects.toThrow(
      'Open-Meteo 요청 한도를 초과했고 저장된 예보가 없습니다.',
    )
  })
})
