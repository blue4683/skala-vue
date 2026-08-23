// BFF·실 예보 연동 전까지 쓰는 목업 날씨 생성기. Stage 7의 buildMockForecast와 같은 이유로
// Math.random() 대신 시드 난수를 써서, 새로고침해도 같은 시각의 조건이 흔들리지 않게 한다.

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function siteTimeSeed(siteId, timeIndex, salt) {
  let hash = 0
  for (let i = 0; i < siteId.length; i++) hash = (hash * 31 + siteId.charCodeAt(i)) % 100000
  return hash + timeIndex * 97 + salt
}

/**
 * @param {string} siteId
 * @param {number} timeIndex
 * @returns {{cloudPercent: number, lowCloudPercent: number, precipitationMm: number, visibilityM: number, windSpeedMps: number, temperatureC: number}}
 */
export function mockWeatherAt(siteId, timeIndex) {
  const r1 = seededRandom(siteTimeSeed(siteId, timeIndex, 0.1))
  const r2 = seededRandom(siteTimeSeed(siteId, timeIndex, 0.2))
  const r3 = seededRandom(siteTimeSeed(siteId, timeIndex, 0.3))
  const r4 = seededRandom(siteTimeSeed(siteId, timeIndex, 0.4))
  const r5 = seededRandom(siteTimeSeed(siteId, timeIndex, 0.5))

  const cloudPercent = Math.round(r1 * 100)
  // 강수는 운량이 높을 때만 드물게 발생하도록 해 하드 게이트가 실제로 걸리는 케이스를 만든다.
  const precipitationMm = cloudPercent > 80 && r5 > 0.7 ? Math.round(r5 * 5 * 10) / 10 : 0

  return {
    cloudPercent,
    lowCloudPercent: Math.round(cloudPercent * (0.3 + r2 * 0.4)),
    precipitationMm,
    visibilityM: Math.round(2000 + r3 * 13000),
    windSpeedMps: Math.round((1 + r4 * 9) * 10) / 10,
    temperatureC: Math.round(-5 + r2 * 25),
  }
}
