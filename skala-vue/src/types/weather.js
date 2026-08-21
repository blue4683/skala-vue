// API 원형 타입 (JSDoc). 프로젝트가 순수 JS라 컴파일 타임 강제는 없지만,
// 이 파일의 필드명(wind_deg, temp 등)은 .vue 컴포넌트에 절대 등장하면 안 된다.
// 화면이 쓰는 타입은 반드시 types/scene.js 를 거친다.

/**
 * @typedef {Object} WeatherCondition
 * @property {number} id
 * @property {string} main
 * @property {string} description
 * @property {string} icon
 */

/**
 * @typedef {Object} CurrentData
 * @property {number} dt
 * @property {number} [sunrise] - 극지방에서는 없음
 * @property {number} [sunset] - 극지방에서는 없음
 * @property {number} temp
 * @property {number} feels_like
 * @property {number} pressure
 * @property {number} humidity
 * @property {number} dew_point
 * @property {number} clouds
 * @property {number} uvi
 * @property {number} visibility
 * @property {number} wind_speed
 * @property {number} [wind_gust] - 조건부
 * @property {number} wind_deg
 * @property {{ '1h'?: number }} [rain] - 조건부
 * @property {{ '1h'?: number }} [snow] - 조건부
 * @property {WeatherCondition[]} weather
 */

/**
 * @typedef {Object} OneCallResponse
 * @property {number} lat
 * @property {number} lon
 * @property {string} timezone
 * @property {number} timezone_offset
 * @property {CurrentData[]} data
 * @property {string[]} [alerts] - ID 배열. 상세는 별도 호출
 */

export {}
