import axios from 'axios'

const BASE = 'https://api.openweathermap.org/data/2.5/weather'

export async function fetchCurrentWeather(lat, lon) {
  const apiKey = import.meta.env.VITE_OWM_API_KEY
  if (!apiKey) throw new Error('OpenWeather API 키(VITE_OWM_API_KEY)가 설정되지 않았습니다.')

  try {
    const res = await axios.get(BASE, {
      params: {
        lat,
        lon,
        units: 'metric',
        lang: 'kr',
        appid: apiKey,
      },
    })
    return res.data
  } catch (e) {
    const status = e.response?.status
    throw new Error(`날씨 정보를 불러오지 못했습니다${status ? ` (${status})` : ''}`, { cause: e })
  }
}

export const fetchOneCall = fetchCurrentWeather
