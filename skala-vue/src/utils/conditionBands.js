// 규칙(불리언 조건)을 시간축 위 연속 구간으로 묶는다. 점수화 대신 원본 값을 병치하고
// 조건을 만족하는 구간만 밴드로 칠한다.

/**
 * @param {Array<{t: number}>} series 각 점은 최소 {t: number}를 가진다
 * @param {Array<(point: object) => boolean>} rules
 * @returns {Array<{from: number, to: number}>}
 */
export function buildBands(series, rules) {
  const bands = []
  let open = null

  for (const point of series) {
    const ok = rules.every((r) => r(point))
    if (ok && open === null) open = point.t
    if (!ok && open !== null) {
      bands.push({ from: open, to: point.t })
      open = null
    }
  }
  if (open !== null) bands.push({ from: open, to: series.at(-1).t })
  return bands
}

/**
 * |slope|가 시리즈 내 최대치의 ratio 배 이상인 지점만 통과하는 규칙을 만든다.
 * 절대 cm/h 기준을 쓰지 않는 이유: 조석 진폭이 지점마다 크게 달라(인천 ~800cm vs 부산 ~100cm)
 * 고정 임계값이면 한쪽 지점에서는 항상 걸리고 한쪽에서는 전혀 안 걸린다.
 */
export function strongFlowRule(seriesWithSlope, ratio = 0.6) {
  const maxAbsSlope = Math.max(0, ...seriesWithSlope.map((p) => Math.abs(p.slope ?? 0)))
  const threshold = maxAbsSlope * ratio
  return (point) => Math.abs(point.slope ?? 0) >= threshold
}
