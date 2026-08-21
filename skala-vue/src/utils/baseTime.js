// 기상청 단기예보 발표시각 계산. 02·05·08·11·14·17·20·23시 발표, 발표 후 약 10분 뒤부터 조회 가능.
// 근거: coastal-map-design.md §2.1

const SLOTS = [2, 5, 8, 11, 14, 17, 20, 23]

function ymd(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

/**
 * 현재 시각 기준 가장 최근 발표시각
 * @param {Date} [now]
 * @returns {{base_date: string, base_time: string}}
 */
export function latestBase(now = new Date()) {
  const d = new Date(now.getTime() - 10 * 60 * 1000) // 발표 지연 10분 보정
  const h = d.getHours()
  const slot = [...SLOTS].reverse().find((s) => s <= h)

  if (slot === undefined) {
    const prev = new Date(d)
    prev.setDate(prev.getDate() - 1)
    return { base_date: ymd(prev), base_time: '2300' }
  }
  return { base_date: ymd(d), base_time: String(slot).padStart(2, '0') + '00' }
}
