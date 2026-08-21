import axios from 'axios'

const BASE = 'https://api.openweathermap.org/data/2.5/weather'

/**
 * axios GET만 한다. 가공(정규화)은 normalizeWeather.js / composables 쪽에서.
 * 반환값은 /data/2.5/weather 원본 응답이며 OneCallResponse 모양이 아니다.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<object>}
 */
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
