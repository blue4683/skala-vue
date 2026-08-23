import { describe, it, expect } from 'vitest'
import { latestBase } from './baseTime'

describe('latestBase', () => {
  it('발표시각 직후에는 해당 발표분을 쓴다', () => {
    // 14:15 → 14시 발표분
    expect(latestBase(new Date('2026-08-21T14:15:00'))).toEqual({
      base_date: '20260821',
      base_time: '1400',
    })
  })

  it('발표 후 10분이 지나지 않으면 이전 발표분을 쓴다', () => {
    // 14:05 → 10분 보정으로 13:55 취급 → 11시 발표분
    expect(latestBase(new Date('2026-08-21T14:05:00'))).toEqual({
      base_date: '20260821',
      base_time: '1100',
    })
  })

  it('자정 직후에는 전날 23시 발표분을 쓴다', () => {
    expect(latestBase(new Date('2026-08-21T00:30:00'))).toEqual({
      base_date: '20260820',
      base_time: '2300',
    })
  })

  it('02:15는 당일 02시 발표분 (자정 분기의 경계)', () => {
    expect(latestBase(new Date('2026-08-21T02:15:00'))).toEqual({
      base_date: '20260821',
      base_time: '0200',
    })
  })
})
