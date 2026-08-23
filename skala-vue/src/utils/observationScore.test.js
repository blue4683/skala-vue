import { describe, it, expect } from 'vitest'
import {
  checkHardGate,
  darknessScoreFrom,
  cloudScoreFrom,
  moonScoreFrom,
  visibilityScoreFrom,
  comfortScoreFrom,
  computeScore,
  findBestWindow,
} from './observationScore'

describe('checkHardGate', () => {
  it('태양 고도가 -12° 이상이면 항상 불가', () => {
    expect(checkHardGate({ sunAltitudeDegrees: -8, precipitationMm: 0, cloudPercent: 0 })).toEqual({
      ok: false,
      reason: '아직 하늘이 충분히 어둡지 않음',
    })
  })

  it('경계값 -12°도 불가(>=)', () => {
    expect(checkHardGate({ sunAltitudeDegrees: -12, precipitationMm: 0, cloudPercent: 0 }).ok).toBe(
      false,
    )
  })

  it('강수가 있으면 불가', () => {
    expect(
      checkHardGate({ sunAltitudeDegrees: -20, precipitationMm: 0.1, cloudPercent: 0 }),
    ).toEqual({ ok: false, reason: '강수 예보가 있음' })
  })

  it('운량 85% 이상이면 불가', () => {
    expect(
      checkHardGate({ sunAltitudeDegrees: -20, precipitationMm: 0, cloudPercent: 90 }),
    ).toEqual({ ok: false, reason: '구름이 많아 관측이 어려움' })
  })

  it('전부 만족하면 통과', () => {
    expect(
      checkHardGate({ sunAltitudeDegrees: -20, precipitationMm: 0, cloudPercent: 50 }),
    ).toEqual({
      ok: true,
    })
  })
})

describe('darknessScoreFrom', () => {
  it('0~100 범위를 벗어난 입력을 clamp한다', () => {
    expect(darknessScoreFrom(120)).toBe(100)
    expect(darknessScoreFrom(-5)).toBe(0)
    expect(darknessScoreFrom(88)).toBe(88)
  })
})

describe('cloudScoreFrom', () => {
  it('구름 없으면 만점', () => {
    expect(cloudScoreFrom(0, 0)).toBe(100)
  })
  it('저층운은 총 운량이 같아도 더 크게 감점한다', () => {
    const withLowCloud = cloudScoreFrom(50, 50)
    const withHighCloud = cloudScoreFrom(50, 0)
    expect(withLowCloud).toBeLessThan(withHighCloud)
  })
})

describe('moonScoreFrom', () => {
  it('달이 지평선 아래면 조도와 무관하게 만점', () => {
    expect(moonScoreFrom({ illuminationPercent: 100, altitudeDegrees: -5 })).toBe(100)
  })
  it('보름달이 높이 떠 있으면 큰 감점', () => {
    const score = moonScoreFrom({
      illuminationPercent: 100,
      altitudeDegrees: 60,
      separationDegrees: 20,
    })
    expect(score).toBeLessThan(50)
  })
  it('달과 각거리가 멀수록 감점이 줄어든다', () => {
    const near = moonScoreFrom({
      illuminationPercent: 80,
      altitudeDegrees: 40,
      separationDegrees: 10,
    })
    const far = moonScoreFrom({
      illuminationPercent: 80,
      altitudeDegrees: 40,
      separationDegrees: 90,
    })
    expect(far).toBeGreaterThan(near)
  })
})

describe('visibilityScoreFrom', () => {
  it('10km 이상이면 만점', () => {
    expect(visibilityScoreFrom(10000)).toBe(100)
    expect(visibilityScoreFrom(20000)).toBe(100)
  })
  it('0m이면 0점', () => {
    expect(visibilityScoreFrom(0)).toBe(0)
  })
})

describe('comfortScoreFrom', () => {
  it('무풍·적정 기온이면 만점', () => {
    expect(comfortScoreFrom({ windSpeedMps: 0, temperatureC: 15 })).toBe(100)
  })
  it('바람이 강할수록 감점', () => {
    const calm = comfortScoreFrom({ windSpeedMps: 1, temperatureC: 15 })
    const windy = comfortScoreFrom({ windSpeedMps: 8, temperatureC: 15 })
    expect(windy).toBeLessThan(calm)
  })
  it('영하로 갈수록 추가 감점', () => {
    const mild = comfortScoreFrom({ windSpeedMps: 0, temperatureC: 5 })
    const freezing = comfortScoreFrom({ windSpeedMps: 0, temperatureC: -10 })
    expect(freezing).toBeLessThan(mild)
  })
})

describe('computeScore', () => {
  it('모든 항목 만점이면 100', () => {
    expect(
      computeScore({ darkness: 100, cloud: 100, moon: 100, visibility: 100, comfort: 100 }),
    ).toBe(100)
  })
  it('모든 항목 0점이면 0', () => {
    expect(computeScore({ darkness: 0, cloud: 0, moon: 0, visibility: 0, comfort: 0 })).toBe(0)
  })
  it('가중치대로 계산한다(darkness 0.35, cloud 0.30, moon 0.20, visibility 0.10, comfort 0.05)', () => {
    const score = computeScore({ darkness: 100, cloud: 0, moon: 0, visibility: 0, comfort: 0 })
    expect(score).toBe(35)
  })
})

describe('findBestWindow', () => {
  const HOUR = 3_600_000

  it('연속한 80점 이상 구간을 하나의 창으로 묶는다', () => {
    const slots = [0, 1, 2, 3, 4].map((h) => ({
      time: h * HOUR,
      score: [60, 85, 90, 82, 50][h],
    }))
    expect(findBestWindow(slots)).toEqual({ start: 1 * HOUR, end: 4 * HOUR, averageScore: 86 })
  })

  it('여러 구간이 있으면 더 긴 구간을 우선한다', () => {
    const slots = [0, 1, 2, 3, 4, 5, 6].map((h) => ({
      time: h * HOUR,
      score: [95, 40, 81, 82, 83, 40, 90][h],
    }))
    const result = findBestWindow(slots)
    expect(result.start).toBe(2 * HOUR)
    expect(result.end).toBe(5 * HOUR)
  })

  it('80점 이상 구간이 없으면 null', () => {
    const slots = [0, 1, 2].map((h) => ({ time: h * HOUR, score: 50 }))
    expect(findBestWindow(slots)).toBeNull()
  })

  it('하드 게이트 미통과(score: null)는 구간을 끊는다', () => {
    const slots = [
      { time: 0, score: 90 },
      { time: HOUR, score: null },
      { time: 2 * HOUR, score: 90 },
    ]
    const result = findBestWindow(slots)
    expect(result.start).toBe(0)
    expect(result.end).toBe(HOUR)
  })

  it('구간이 배열 마지막 슬롯까지 이어지면 end는 그 슬롯 + 1시간이다(시작과 같은 값이 되면 안 됨)', () => {
    const slots = [0, 1, 2].map((h) => ({ time: h * HOUR, score: [40, 85, 90][h] }))
    const result = findBestWindow(slots)
    expect(result.start).toBe(1 * HOUR)
    expect(result.end).toBe(3 * HOUR)
    expect(result.end).not.toBe(result.start)
  })
})
