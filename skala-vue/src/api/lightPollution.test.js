import { describe, expect, it } from 'vitest'
import { radianceToDarknessScore } from './lightPollution'

describe('radianceToDarknessScore', () => {
  it('복사휘도가 높을수록 상대 어두움 지수가 낮다', () => {
    expect(radianceToDarknessScore(0)).toBe(100)
    expect(radianceToDarknessScore(1)).toBeGreaterThan(radianceToDarknessScore(10))
    expect(radianceToDarknessScore(10)).toBeGreaterThan(radianceToDarknessScore(100))
  })

  it('유효하지 않은 값은 점수화하지 않는다', () => {
    expect(radianceToDarknessScore(Number.NaN)).toBeNull()
  })
})
