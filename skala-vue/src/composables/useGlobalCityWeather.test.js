import { describe, expect, it } from 'vitest'
import stargazingCitiesData from '@/data/globalStargazingCities.json'
import { useGlobalCityWeather } from './useGlobalCityWeather'

describe('useGlobalCityWeather', () => {
  it('별 관측 지도와 동일한 도시 목록을 제공한다', () => {
    const { cities, cityWeatherList } = useGlobalCityWeather()

    expect(cities.map((city) => city.id)).toEqual(
      stargazingCitiesData.cities.map((city) => city.id),
    )
    expect(cityWeatherList.value).toHaveLength(stargazingCitiesData.cities.length)
  })

  it('상세 페이지용 도시 ID 조회를 지원한다', () => {
    const { cityById } = useGlobalCityWeather()

    expect(cityById('san-pedro-de-atacama-cl')).toMatchObject({
      nameKo: '산페드로데아타카마',
      countryCode: 'CL',
    })
    expect(cityById('missing-city')).toBeNull()
  })
})
