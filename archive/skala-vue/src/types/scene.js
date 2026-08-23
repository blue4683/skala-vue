// 화면 언어 타입 (JSDoc). 컴포넌트는 이 타입만 알아야 한다 — OneCallResponse를 몰라야 한다.

/**
 * @typedef {Object} ObservationParams
 * @property {number} cloudDensity - 0~1
 * @property {number} driftX - -1~1 (+면 오른쪽=동쪽으로 흐름)
 * @property {number} driftSpeed - 0~1
 * @property {number} gustAmplitude - 0~1
 * @property {number} rainRate - 0~1
 * @property {number} snowRate - 0~1
 * @property {number} blurPx - 0~12
 * @property {number} hazeOpacity - 0~0.4
 * @property {number} condition - weather.id
 */

/**
 * @typedef {Object} TimeParams
 * @property {'normal'|'polar-day'|'polar-night'} mode
 * @property {boolean} isNight
 * @property {number} altitude - 0~1 (천정=1, 지평선=0)
 * @property {number} bodyX - 0~1 (화면 가로 위치)
 * @property {number} progress - 0~1 (일출→일몰 진행도)
 * @property {[string, string]} skyStops
 */

/**
 * @typedef {ObservationParams & TimeParams & {seaLevel?: number}} SceneParams
 * seaLevel: 0~1, 조위 정규화값. 물때 데이터가 없으면 생략(SeaLayer 미표시).
 */

export {}
