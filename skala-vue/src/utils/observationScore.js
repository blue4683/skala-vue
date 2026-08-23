// 관측 적합도 판정. 설계서(docs/star-observation-map-design.md) §5.
// 점수화 이전에 하드 게이트를 먼저 통과해야 하고, 통과한 시각에만 가중합 점수를 매긴다.

const clamp = (n, min = 0, max = 100) => Math.min(max, Math.max(min, n))
const HOUR_MS = 3_600_000

/**
 * @param {object} input
 * @param {number} input.sunAltitudeDegrees
 * @param {number} input.precipitationMm
 * @param {number} input.cloudPercent 총 운량(%)
 * @returns {{ok: true} | {ok: false, reason: string}}
 */
export function checkHardGate({ sunAltitudeDegrees, precipitationMm, cloudPercent }) {
  if (sunAltitudeDegrees >= -12) {
    return { ok: false, reason: '아직 하늘이 충분히 어둡지 않음' }
  }
  if (precipitationMm > 0) {
    return { ok: false, reason: '강수 예보가 있음' }
  }
  if (cloudPercent >= 85) {
    return { ok: false, reason: '구름이 많아 관측이 어려움' }
  }
  return { ok: true }
}

/** 광공해 등급(0~100, 클수록 어두움)을 그대로 darkness 점수로 쓴다. */
export function darknessScoreFrom(darknessScore) {
  return clamp(darknessScore)
}

/** 총 운량 기반, 저층운일수록 더 크게 감점한다. */
export function cloudScoreFrom(cloudPercent, lowCloudPercent = cloudPercent) {
  const base = 100 - cloudPercent
  const lowPenalty = lowCloudPercent * 0.3
  return clamp(base - lowPenalty)
}

/**
 * 달의 조도(illuminationPercent)·고도·대상과의 각거리를 함께 반영한다.
 * 달이 지평선 아래면 조도와 무관하게 영향이 없다.
 */
export function moonScoreFrom({ illuminationPercent, altitudeDegrees, separationDegrees = 90 }) {
  if (altitudeDegrees < 0) return 100
  const glarePenalty = (illuminationPercent / 100) * 100
  const separationRelief = clamp(separationDegrees, 0, 90) / 90 // 멀수록 영향 감소
  return clamp(100 - glarePenalty * (1 - separationRelief * 0.5))
}

/** 시정(m). VISIBILITY_CAP(10km) 이상이면 만점. */
const VISIBILITY_CAP_M = 10000
export function visibilityScoreFrom(meters) {
  return clamp((meters / VISIBILITY_CAP_M) * 100)
}

/** 풍속·기온으로 관측 편의만 반영한다(과학적 조건이 아니라 쾌적함). */
export function comfortScoreFrom({ windSpeedMps, temperatureC }) {
  const windPenalty = clamp(windSpeedMps * 6, 0, 60)
  const coldPenalty = temperatureC < 0 ? clamp(-temperatureC * 2, 0, 40) : 0
  return clamp(100 - windPenalty - coldPenalty)
}

const WEIGHTS = { darkness: 0.35, cloud: 0.3, moon: 0.2, visibility: 0.1, comfort: 0.05 }

/**
 * @param {{darkness: number, cloud: number, moon: number, visibility: number, comfort: number}} factors 각 0~100
 * @returns {number} 0~100 정수
 */
export function computeScore(factors) {
  const raw =
    factors.darkness * WEIGHTS.darkness +
    factors.cloud * WEIGHTS.cloud +
    factors.moon * WEIGHTS.moon +
    factors.visibility * WEIGHTS.visibility +
    factors.comfort * WEIGHTS.comfort
  return Math.round(clamp(raw))
}

/**
 * 연속한 80점 이상 구간을 "추천 시간 창"으로 묶는다.
 * 가장 긴 구간을 우선하고, 길이가 같으면 평균 점수가 높은 구간을 선택한다.
 * @param {Array<{time: number, score: number|null}>} hourlySlots score가 null이면 하드 게이트 미통과
 * @param {number} [threshold]
 * @returns {{start: number, end: number, averageScore: number} | null}
 */
export function findBestWindow(hourlySlots, threshold = 80) {
  const windows = []
  let open = null

  for (const slot of hourlySlots) {
    const passes = slot.score !== null && slot.score >= threshold
    if (passes && open === null) {
      open = { start: slot.time, scores: [slot.score] }
    } else if (passes && open !== null) {
      open.scores.push(slot.score)
    } else if (!passes && open !== null) {
      windows.push({ ...open, end: slot.time })
      open = null
    }
  }
  if (open !== null) {
    // 마지막 슬롯까지 구간이 이어지면, 실패 슬롯이 없어 경계를 알 수 없다.
    // 슬롯 간격(보통 1시간)만큼 더해 "그 시각까지"라는 의미를 일관되게 유지한다.
    const step = hourlySlots.length > 1 ? hourlySlots[1].time - hourlySlots[0].time : HOUR_MS
    windows.push({ ...open, end: hourlySlots.at(-1).time + step })
  }
  if (!windows.length) return null

  windows.sort((a, b) => {
    const lenDiff = b.scores.length - a.scores.length
    if (lenDiff !== 0) return lenDiff
    const avg = (w) => w.scores.reduce((s, v) => s + v, 0) / w.scores.length
    return avg(b) - avg(a)
  })

  const best = windows[0]
  const averageScore = Math.round(best.scores.reduce((s, v) => s + v, 0) / best.scores.length)
  return { start: best.start, end: best.end, averageScore }
}
