import axios from 'axios'
import { latestBase } from '@/utils/baseTime'

// 기상청 단기예보 조회서비스(VilageFcstInfoService_2.0/getVilageFcst).
// 근거: coastal-map-design.md §2.1. VITE_KMA_API_KEY 발급 전까지는
// useCoastalData.js에서 src/mocks/kma/forecast.js를 대신 사용한다.
const BASE = '/kma/VilageFcstInfoService_2.0/getVilageFcst'

const NUMERIC_CATEGORIES = new Set(['WAV', 'WSD', 'VEC', 'POP', 'PTY', 'TMP', 'SKY'])

function toEpochMs(fcstDate, fcstTime) {
  const y = fcstDate.slice(0, 4)
  const m = fcstDate.slice(4, 6)
  const d = fcstDate.slice(6, 8)
  const h = fcstTime.slice(0, 2)
  const min = fcstTime.slice(2, 4)
  return new Date(`${y}-${m}-${d}T${h}:${min}:00`).getTime()
}

/**
 * 단기예보 원본 응답 → 시각별 예보 배열
 * @param {object} raw
 * @returns {Array<{time: number, WAV?: number, WSD?: number, VEC?: number, POP?: number, PTY?: number, TMP?: number, SKY?: number}>}
 */
export function normalizeForecastResponse(raw) {
  const header = raw?.response?.header
  if (header?.resultCode !== '00') {
    throw new Error(header?.resultMsg ?? '단기예보 응답 형식이 올바르지 않습니다')
  }
  const item = raw.response.body?.items?.item ?? []
  const rows = Array.isArray(item) ? item : [item]

  const byTime = new Map()
  for (const row of rows) {
    if (!NUMERIC_CATEGORIES.has(row.category)) continue
    const time = toEpochMs(row.fcstDate, row.fcstTime)
    if (!byTime.has(time)) byTime.set(time, { time })
    byTime.get(time)[row.category] = Number(row.fcstValue)
  }
  return [...byTime.values()].sort((a, b) => a.time - b.time)
}

/**
 * @param {number} nx
 * @param {number} ny
 * @returns {Promise<Array<{time: number}>>}
 */
export async function fetchVillageForecast(nx, ny) {
  const { base_date, base_time } = latestBase()
  try {
    const res = await axios.get(BASE, {
      params: {
        serviceKey: decodeURIComponent(import.meta.env.VITE_KMA_API_KEY),
        dataType: 'JSON',
        numOfRows: 1000,
        pageNo: 1,
        base_date,
        base_time,
        nx,
        ny,
      },
    })
    return normalizeForecastResponse(res.data)
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const status = e.response?.status
      throw new Error(`단기예보를 불러오지 못했습니다${status ? ` (${status})` : ''}`, { cause: e })
    }
    throw e
  }
}
