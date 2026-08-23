import { computed, ref } from 'vue'
import stargazingCitiesData from '@/data/globalStargazingCities.json'
import { fetchCurrentWeather } from '@/api/weather'
import { normalizeWeatherSummary } from '@/api/normalizeWeather'

const cities = stargazingCitiesData.cities
const weatherByCity = ref({})
const loading = ref(false)
const error = ref(null)
const updatedAt = ref(null)
const initialized = ref(false)
let pendingRequest = null

export function useGlobalCityWeather() {
  const cityWeatherList = computed(() =>
    cities.map((city) => ({
      ...city,
      weather: weatherByCity.value[city.id] ?? null,
    })),
  )

  async function loadAll({ force = false } = {}) {
    if (!force && Object.keys(weatherByCity.value).length) return
    if (pendingRequest) return pendingRequest

    loading.value = true
    error.value = null
    pendingRequest = Promise.allSettled(
      cities.map(async (city) => ({
        cityId: city.id,
        weather: normalizeWeatherSummary(await fetchCurrentWeather(city.latitude, city.longitude)),
      })),
    )
      .then((results) => {
        const nextWeather = {}
        let failureCount = 0
        let firstFailure = null

        for (const result of results) {
          if (result.status === 'fulfilled') {
            nextWeather[result.value.cityId] = result.value.weather
          } else {
            failureCount += 1
            firstFailure ??= result.reason
          }
        }

        if (Object.keys(nextWeather).length) {
          weatherByCity.value = { ...weatherByCity.value, ...nextWeather }
          updatedAt.value = new Date()
        }

        if (failureCount === cities.length) {
          error.value =
            firstFailure instanceof Error
              ? firstFailure.message
              : '도시 날씨 정보를 불러오지 못했습니다.'
        } else if (failureCount > 0) {
          error.value = `${failureCount}개 도시의 날씨 정보를 불러오지 못했습니다.`
        }
      })
      .catch((reason) => {
        error.value =
          reason instanceof Error ? reason.message : '도시 날씨 정보를 불러오지 못했습니다.'
      })
      .finally(() => {
        loading.value = false
        initialized.value = true
        pendingRequest = null
      })

    return pendingRequest
  }

  function cityById(cityId) {
    return cities.find((city) => city.id === cityId) ?? null
  }

  function weatherForCity(cityId) {
    return weatherByCity.value[cityId] ?? null
  }

  return {
    cities,
    cityWeatherList,
    loading,
    initialized,
    error,
    updatedAt,
    loadAll,
    cityById,
    weatherForCity,
  }
}
