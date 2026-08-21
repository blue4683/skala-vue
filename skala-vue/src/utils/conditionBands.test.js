import { describe, it, expect } from 'vitest'
import { buildBands, strongFlowRule } from './conditionBands'

describe('buildBands', () => {
  const series = [0, 1, 2, 3, 4, 5].map((t) => ({ t }))

  it('규칙을 만족하는 연속 구간을 하나의 밴드로 묶는다 (to는 처음 불만족하는 지점)', () => {
    const rule = (p) => p.t >= 1 && p.t <= 3
    expect(buildBands(series, [rule])).toEqual([{ from: 1, to: 4 }])
  })

  it('만족 구간이 여러 개면 밴드도 여러 개', () => {
    const rule = (p) => p.t === 0 || p.t === 5
    expect(buildBands(series, [rule])).toEqual([
      { from: 0, to: 1 },
      { from: 5, to: 5 },
    ])
  })

  it('구간이 마지막 점까지 이어지면 마지막 점을 to로 닫는다', () => {
    const rule = (p) => p.t >= 3
    expect(buildBands(series, [rule])).toEqual([{ from: 3, to: 5 }])
  })

  it('아무 조건도 만족하지 않으면 빈 배열', () => {
    expect(buildBands(series, [() => false])).toEqual([])
  })

  it('여러 규칙은 AND로 결합된다', () => {
    const rules = [(p) => p.t >= 1, (p) => p.t <= 2]
    expect(buildBands(series, rules)).toEqual([{ from: 1, to: 3 }])
  })
})

describe('strongFlowRule', () => {
  it('최대 slope의 ratio 배 이상인 점만 통과시킨다', () => {
    const series = [{ slope: 0 }, { slope: 50 }, { slope: 100 }, { slope: -100 }, { slope: 10 }]
    const rule = strongFlowRule(series, 0.6) // threshold = 60
    expect(series.map(rule)).toEqual([false, false, true, true, false])
  })

  it('slope가 전부 0이면 threshold도 0이라 모두 통과', () => {
    const series = [{ slope: 0 }, { slope: 0 }]
    const rule = strongFlowRule(series)
    expect(series.map(rule)).toEqual([true, true])
  })
})
