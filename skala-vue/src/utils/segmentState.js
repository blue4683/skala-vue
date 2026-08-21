// 구간·시각 단위 상태 판정. 특보가 최우선이며, 자체 규칙이 전부 통과해도
// 특보가 걸려 있으면 무조건 blocked다. 근거: coastal-map-design.md §5.1

/**
 * @param {object|null} fc 해당 구간·시각의 예보 (WAV, WSD, POP, VEC...), nodata면 null
 * @param {object|null} tide 해당 시각의 조위 정보 (조석 미연동 시 null)
 * @param {Array<{title: string}>} warns 해당 구간에 걸린 특보 목록
 * @param {Array<{id: string, label: string, test: Function}>} rules 활성화된 규칙
 * @returns {{level: 'nodata'|'blocked'|'caution'|'open', reason?: string[]}}
 */
export function segmentState(fc, tide, warns, rules) {
  if (!fc) return { level: 'nodata' }

  if (warns.length > 0) {
    return { level: 'blocked', reason: warns.map((w) => w.title) }
  }

  const failed = rules.filter((r) => !r.test(fc, tide)).map((r) => r.label)
  return failed.length ? { level: 'caution', reason: failed } : { level: 'open', reason: [] }
}
