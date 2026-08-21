import { describe, it, expect } from 'vitest'
import { tideLevelAt, buildTideSeries, tideExtent, withTideSlope } from './tideCurve'

const HOUR = 3_600_000

// 저조 0 → 고조 400, 6시간 간격
const extrema = [
  { time: 0, level: 0, type: 'low' },
  { time: 6 * HOUR, level: 400, type: 'high' },
  { time: 12 * HOUR, level: 0, type: 'low' },
]

describe('tideLevelAt', () => {
  it('극점에서 오차 0', () => {
    expect(tideLevelAt(extrema, 0)).toBe(0)
    expect(tideLevelAt(extrema, 6 * HOUR)).toBe(400)
    expect(tideLevelAt(extrema, 12 * HOUR)).toBe(0)
  })

  it('반주기 중간 지점은 평균값(코사인 90도)', () => {
    // ratio=0.5 → cos(π/2)=0 → mid(200)
    expect(tideLevelAt(extrema, 3 * HOUR)).toBeCloseTo(200, 6)
  })

  it('범위 밖은 null', () => {
    expect(tideLevelAt(extrema, -HOUR)).toBeNull()
    expect(tideLevelAt(extrema, 13 * HOUR)).toBeNull()
  })

  it('극점이 1개 이하면 항상 null', () => {
    expect(tideLevelAt([{ time: 0, level: 100, type: 'low' }], 0)).toBeNull()
    expect(tideLevelAt([], 0)).toBeNull()
  })
})

describe('buildTideSeries', () => {
  it('step 간격으로 범위 내 샘플을 만들고, 끝점을 포함한다', () => {
    const series = buildTideSeries(extrema, 0, 12 * HOUR, HOUR)
    expect(series.length).toBe(13)
    expect(series[0]).toEqual({ t: 0, level: 0 })
    expect(series.at(-1).level).toBeCloseTo(0, 6)
  })

  it('범위가 극점 밖이면 빈 배열', () => {
    expect(buildTideSeries(extrema, 100 * HOUR, 110 * HOUR, HOUR)).toEqual([])
  })
})

describe('tideExtent', () => {
  it('최소/최대 조위를 반환', () => {
    expect(tideExtent(extrema)).toEqual({ min: 0, max: 400 })
  })

  it('빈 배열이면 0/0', () => {
    expect(tideExtent([])).toEqual({ min: 0, max: 0 })
  })
})

describe('withTideSlope', () => {
  it('일정한 기울기의 시계열에서 정확한 slope(cm/h)를 계산한다', () => {
    // 1시간 간격, 매 시간 100cm씩 상승
    const series = [0, 1, 2, 3].map((h) => ({ t: h * HOUR, level: h * 100 }))
    const withSlope = withTideSlope(series)
    expect(withSlope.map((p) => p.slope)).toEqual([100, 100, 100, 100])
  })

  it('양 끝은 편측차분을 쓰고, 값이 하나뿐이면 slope 0', () => {
    const series = [{ t: 0, level: 50 }]
    expect(withTideSlope(series)).toEqual([{ t: 0, level: 50, slope: 0 }])
  })
})
