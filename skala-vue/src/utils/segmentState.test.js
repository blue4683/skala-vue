import { describe, it, expect } from 'vitest'
import { segmentState } from './segmentState'

const RULES = [
  { id: 'wind', label: '풍속 6m/s 미만', test: (f) => f.WSD < 6 },
  { id: 'wave', label: '파고 1m 미만', test: (f) => f.WAV < 1.0 },
]

const GOOD = { WSD: 3, WAV: 0.5 }
const WINDY = { WSD: 9, WAV: 0.5 }

describe('segmentState', () => {
  it('예보가 없으면 nodata', () => {
    expect(segmentState(null, null, [], RULES)).toEqual({ level: 'nodata' })
  })

  it('모든 규칙을 통과하면 open', () => {
    expect(segmentState(GOOD, null, [], RULES)).toEqual({ level: 'open', reason: [] })
  })

  it('미충족 규칙이 있으면 caution + 해당 label을 사유로 준다', () => {
    expect(segmentState(WINDY, null, [], RULES)).toEqual({
      level: 'caution',
      reason: ['풍속 6m/s 미만'],
    })
  })

  it('특보가 있으면 규칙을 전부 통과해도 blocked (특보 최우선)', () => {
    const warns = [{ title: '풍랑주의보' }]
    expect(segmentState(GOOD, null, warns, RULES)).toEqual({
      level: 'blocked',
      reason: ['풍랑주의보'],
    })
  })

  it('nodata는 특보보다도 우선한다 (판정 자체가 불가능)', () => {
    const warns = [{ title: '풍랑주의보' }]
    expect(segmentState(null, null, warns, RULES)).toEqual({ level: 'nodata' })
  })
})
