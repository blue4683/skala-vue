import { beforeEach, describe, expect, it, vi } from 'vitest'
import stargazingCitiesData from '@/data/globalStargazingCities.json'
import { fetchCurrentWeather } from '@/api/weather'
import { useGlobalCityWeather } from './useGlobalCityWeather'

vi.mock('@/api/weather', () => ({
  fetchCurrentWeather: vi.fn(),
}))

const OPEN_WEATHER_RESPONSE = {
  dt: 1_800_000_000,
  weather: [{ id: 800, description: '맑음' }],
  main: { temp: 15, feels_like: 14, humidity: 50, pressure: 1012 },
  clouds: { all: 0 },
  visibility: 10000,
  wind: { speed: 2, deg: 180 },
}

describe('useGlobalCityWeather loadAll', () => {
  beforeEach(() => {
    vi.mocked(fetchCurrentWeather).mockReset()
  })

  it('일부 도시 요청이 실패해도 성공한 도시 날씨를 유지한다', async () => {
    vi.mocked(fetchCurrentWeather).mockImplementation((latitude) =>
      latitude === stargazingCitiesData.cities[0].latitude
        ? Promise.reject(new Error('요청 실패'))
        : Promise.resolve(OPEN_WEATHER_RESPONSE),
    )

    const { cityWeatherList, error, loadAll } = useGlobalCityWeather()
    await loadAll({ force: true })

    expect(fetchCurrentWeather).toHaveBeenCalledTimes(stargazingCitiesData.cities.length)
    expect(cityWeatherList.value.filter((city) => city.weather)).toHaveLength(
      stargazingCitiesData.cities.length - 1,
    )
    expect(error.value).toBe('1개 도시의 날씨 정보를 불러오지 못했습니다.')
  })
})
