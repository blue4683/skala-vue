import axios from 'axios'

const BASE = 'https://api.openweathermap.org/data/2.5/weather'

export async function fetchOneCall(lat, lon) {
  try {
    const res = await axios.get(BASE, {
      params: {
        lat,
        lon,
        units: 'metric',
        lang: 'kr',
        appid: import.meta.env.VITE_OWM_API_KEY,
      },
    })
    return res.data
  } catch (e) {
    const status = e.response?.status
    throw new Error(`날씨 정보를 불러오지 못했습니다${status ? ` (${status})` : ''}`, { cause: e })
  }
}
