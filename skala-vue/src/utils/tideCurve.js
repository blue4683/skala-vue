// 고/저조 극점(하루 4개 안팎) 사이를 반주기 코사인으로 보간해 연속 조위 곡선을 만든다.

/**
 * @typedef {Object} TideExtremum
 * @property {number} time - epoch ms
 * @property {number} level - 조위(cm)
 * @property {'high'|'low'} type
 */

/**
 * 고/저조 극점 배열 → 임의 시각의 조위
 * @param {TideExtremum[]} extrema 시각 오름차순
 * @param {number} t epoch ms
 * @returns {number|null} 조위(cm), 범위 밖이면 null
 */
export function tideLevelAt(extrema, t) {
  for (let i = 0; i < extrema.length - 1; i++) {
    const a = extrema[i]
    const b = extrema[i + 1]
    if (t < a.time || t > b.time) continue

    const ratio = (t - a.time) / (b.time - a.time)
    const mid = (a.level + b.level) / 2
    const amp = (a.level - b.level) / 2
    return mid + amp * Math.cos(Math.PI * ratio)
  }
  return null
}

/**
 * 스크러버용 샘플링
 * @param {number} [stepMs] 기본 10분
 */
export function buildTideSeries(extrema, startMs, endMs, stepMs = 600_000) {
  const out = []
  for (let t = startMs; t <= endMs; t += stepMs) {
    const level = tideLevelAt(extrema, t)
    if (level !== null) out.push({ t, level })
  }
  return out
}

/**
 * 극점 배열의 조위 범위 (곡선 y축 스케일, 해수면 정규화 등에 공용으로 쓰인다)
 */
export function tideExtent(extrema) {
  if (!extrema.length) return { min: 0, max: 0 }
  const levels = extrema.map((p) => p.level)
  return { min: Math.min(...levels), max: Math.max(...levels) }
}

/**
 * 조위 시계열에 시간당 변화율(cm/h)을 붙인다. 중앙차분, 양 끝은 편측차분.
 * "물이 세게 흐르는 구간" 판정에 쓰인다.
 */
export function withTideSlope(series) {
  return series.map((p, i) => {
    const a = series[i - 1] ?? p
    const b = series[i + 1] ?? p
    const dtHours = (b.t - a.t) / 3_600_000
    const slope = dtHours === 0 ? 0 : (b.level - a.level) / dtHours
    return { ...p, slope }
  })
}
