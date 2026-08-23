import { describe, it, expect } from 'vitest'
import {
  estimateLimitingMagnitude,
  classifyConstellation,
  evaluateConstellations,
} from './constellationVisibility'

const PERFECT_SKY = {
  sunAltitudeDegrees: -30,
  moonIlluminationPercent: 0,
  moonAltitudeDegrees: -10,
  darknessScore: 100,
}

describe('estimateLimitingMagnitude', () => {
  it('완전히 어두운 하늘일수록 한계등급이 높다(더 어두운 별까지 보임)', () => {
    const dark = estimateLimitingMagnitude(PERFECT_SKY)
    const lightPolluted = estimateLimitingMagnitude({ ...PERFECT_SKY, darknessScore: 10 })
    expect(dark).toBeGreaterThan(lightPolluted)
  })

  it('보름달이 높이 떠 있으면 한계등급이 크게 낮아진다', () => {
    const noMoon = estimateLimitingMagnitude(PERFECT_SKY)
    const fullMoon = estimateLimitingMagnitude({
      ...PERFECT_SKY,
      moonIlluminationPercent: 100,
      moonAltitudeDegrees: 60,
    })
    expect(fullMoon).toBeLessThan(noMoon)
  })

  it('황혼(-12°에 가까움)일수록 한계등급이 낮아진다', () => {
    const deepNight = estimateLimitingMagnitude(PERFECT_SKY)
    const twilight = estimateLimitingMagnitude({ ...PERFECT_SKY, sunAltitudeDegrees: -13 })
    expect(twilight).toBeLessThan(deepNight)
  })
})

const CYGNUS = {
  id: 'CYG',
  nameKo: '백조자리',
  keyStars: [
    { name: 'Deneb', raHours: 20.69, decDegrees: 45.28, magnitude: 1.25 },
    { name: 'Sadr', raHours: 20.37, decDegrees: 40.25, magnitude: 2.23 },
    { name: 'Albireo', raHours: 19.51, decDegrees: 27.97, magnitude: 3.18 },
  ],
}

describe('classifyConstellation', () => {
  it('대표별 3개 이상이 기준을 만족하면 선명(clear)', () => {
    const positions = [
      { altitudeDegrees: 60, azimuthDegrees: 10 },
      { altitudeDegrees: 55, azimuthDegrees: 12 },
      { altitudeDegrees: 50, azimuthDegrees: 15 },
    ]
    const result = classifyConstellation(CYGNUS, positions, 5) // 한계등급 5 → 전부 보임
    expect(result.state).toBe('clear')
    expect(result.visibleCount).toBe(3)
  })

  it('대표별 2개만 기준을 만족하면 관측 가능(visible)', () => {
    const positions = [
      { altitudeDegrees: 60, azimuthDegrees: 10 },
      { altitudeDegrees: 55, azimuthDegrees: 12 },
      { altitudeDegrees: 50, azimuthDegrees: 15 },
    ]
    const result = classifyConstellation(CYGNUS, positions, 2.5) // Albireo(3.18)만 탈락
    expect(result.state).toBe('visible')
    expect(result.visibleCount).toBe(2)
  })

  it('고도 10°인 대표별은 관측 가능 목록에 들어가지 않는다(지평선 근처)', () => {
    const positions = [
      { altitudeDegrees: 10, azimuthDegrees: 55 }, // Deneb, 고도 미달
      { altitudeDegrees: 8, azimuthDegrees: 56 }, // Sadr, 고도 미달
      { altitudeDegrees: 5, azimuthDegrees: 57 }, // Albireo, 고도 미달
    ]
    const result = classifyConstellation(CYGNUS, positions, 5)
    expect(result.state).toBe('difficult')
    expect(result.visibleCount).toBe(0)
  })

  it('가장 밝은(등급 숫자가 작은) 보이는 별을 대표로 반환한다', () => {
    const positions = [
      { altitudeDegrees: 60, azimuthDegrees: 10 },
      { altitudeDegrees: 55, azimuthDegrees: 12 },
      { altitudeDegrees: 50, azimuthDegrees: 15 },
    ]
    const result = classifyConstellation(CYGNUS, positions, 5)
    expect(result.best.name).toBe('Deneb')
  })
})

describe('evaluateConstellations', () => {
  it('altAzFor을 각 keyStar에 적용해 결과 배열을 만든다', () => {
    const altAzFor = () => ({ altitudeDegrees: 45, azimuthDegrees: 90 })
    const results = evaluateConstellations([CYGNUS], altAzFor, PERFECT_SKY)
    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({ id: 'CYG', nameKo: '백조자리', state: 'clear' })
  })

  it('전부 지평선 아래면 모든 별자리가 관측 어려움이다', () => {
    const altAzFor = () => ({ altitudeDegrees: -10, azimuthDegrees: 0 })
    const results = evaluateConstellations([CYGNUS], altAzFor, PERFECT_SKY)
    expect(results[0].state).toBe('difficult')
  })
})
