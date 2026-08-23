// 별자리 판정. 설계서 §6.2. 좌표 변환(적경/적위 → 고도/방위)은 composables/useAstronomy.js가
// Astronomy Engine으로 계산해 넘겨주고, 이 파일은 그 결과를 판정만 하는 순수 함수다.

const MIN_ALTITUDE_DEGREES = 20

/**
 * 태양 고도·달빛·광공해로부터 이 시각·장소에서 맨눈으로 볼 수 있는 한계등급을 추정한다.
 * 값이 작을수록(더 밝은 별만 보임) 조건이 나쁘다는 뜻이다.
 * @param {{sunAltitudeDegrees: number, moonIlluminationPercent: number, moonAltitudeDegrees: number, darknessScore: number}} conditions
 * @returns {number} 한계등급(낮을수록 밝은 별만 보임)
 */
export function estimateLimitingMagnitude({
  sunAltitudeDegrees,
  moonIlluminationPercent,
  moonAltitudeDegrees,
  darknessScore,
}) {
  // 완전히 어두운 시골 하늘(darknessScore=100, 황혼·달빛 없음) 기준 약 6.5등급에서 시작한다.
  let limit = 3.5 + (darknessScore / 100) * 3.0

  // 황혼(-12°~-18°)에 가까울수록 하늘이 아직 밝아 한계등급이 낮아진다.
  if (sunAltitudeDegrees > -18) {
    const twilightFactor = (sunAltitudeDegrees + 18) / 6 // -18→0, -12→1
    limit -= twilightFactor * 2.5
  }

  // 달이 지평선 위에 있고 밝을수록 한계등급이 낮아진다.
  if (moonAltitudeDegrees > 0) {
    limit -= (moonIlluminationPercent / 100) * 2.0
  }

  return limit
}

/**
 * @param {import('@/data/constellations.json').constellations[number]} constellation
 * @param {Array<{altitudeDegrees: number, azimuthDegrees: number}>} starPositions constellation.keyStars와 같은 순서
 * @param {number} limitingMagnitude
 * @returns {{state: 'clear'|'visible'|'difficult', visibleCount: number, best: {name: string, azimuthDegrees: number, altitudeDegrees: number}|null}}
 */
export function classifyConstellation(constellation, starPositions, limitingMagnitude) {
  const visible = constellation.keyStars
    .map((star, i) => ({ star, pos: starPositions[i] }))
    .filter(
      ({ star, pos }) =>
        pos.altitudeDegrees >= MIN_ALTITUDE_DEGREES && star.magnitude <= limitingMagnitude,
    )

  const state = visible.length >= 3 ? 'clear' : visible.length >= 2 ? 'visible' : 'difficult'

  // 화면에 대표로 보여줄 별: 보이는 별 중 가장 밝은 별, 없으면 지평선에 가장 가까운 별.
  // 후자를 첫 번째 별로 고정하면 일부가 지평선 위여도 별자리 전체가 아래로 잘못 표시될 수 있다.
  const best = visible.length
    ? visible.reduce((a, b) => (a.star.magnitude <= b.star.magnitude ? a : b))
    : constellation.keyStars
        .map((star, i) => ({ star, pos: starPositions[i] }))
        .reduce((a, b) => (a.pos.altitudeDegrees >= b.pos.altitudeDegrees ? a : b))

  return {
    state,
    visibleCount: visible.length,
    best: {
      name: best.star.name,
      azimuthDegrees: best.pos.azimuthDegrees,
      altitudeDegrees: best.pos.altitudeDegrees,
    },
  }
}

/**
 * @param {Array<object>} constellations constellations.json의 constellations 배열
 * @param {(raHours: number, decDegrees: number) => {altitudeDegrees: number, azimuthDegrees: number}} altAzFor
 * @param {object} conditions estimateLimitingMagnitude의 입력
 * @returns {Array<{id: string, nameKo: string, state: string, visibleCount: number, azimuthDegrees: number, altitudeDegrees: number}>}
 */
export function evaluateConstellations(constellations, altAzFor, conditions) {
  const limitingMagnitude = estimateLimitingMagnitude(conditions)

  return constellations.flatMap((c) => {
    const starPositions = c.keyStars.map((s) => altAzFor(s.raHours, s.decDegrees))
    const result = classifyConstellation(c, starPositions, limitingMagnitude)
    if (result.best.altitudeDegrees < 0) return []

    return [
      {
        id: c.id,
        nameKo: c.nameKo,
        state: result.state,
        visibleCount: result.visibleCount,
        azimuthDegrees: result.best.azimuthDegrees,
        altitudeDegrees: result.best.altitudeDegrees,
      },
    ]
  })
}
