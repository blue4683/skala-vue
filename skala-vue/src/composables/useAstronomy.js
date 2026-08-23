// Astronomy Engine을 감싸는 층. 설계서 §6.3 — 관측자 위치·시각 기준 태양·달·별의
// 고도/방위를 계산한다. 여기서 계산한 alt/az를 utils/constellationVisibility.js가 판정한다.
import { Observer, Body, Equator, Horizon, Illumination, SearchAltitude } from 'astronomy-engine'

function altAz(body, date, observer) {
  const eq = Equator(body, date, observer, true, true)
  return Horizon(date, observer, eq.ra, eq.dec, 'normal')
}

export function useAstronomy() {
  function makeObserver(latitude, longitude, elevationM = 0) {
    return new Observer(latitude, longitude, elevationM)
  }

  /** @returns {number} 태양 고도(도) */
  function sunAltitude(date, observer) {
    return altAz(Body.Sun, date, observer).altitude
  }

  /** @returns {{altitudeDegrees: number, azimuthDegrees: number, illuminationPercent: number}} */
  function moonInfo(date, observer) {
    const hor = altAz(Body.Moon, date, observer)
    const illum = Illumination(Body.Moon, date)
    return {
      altitudeDegrees: hor.altitude,
      azimuthDegrees: hor.azimuth,
      illuminationPercent: Math.round(illum.phase_fraction * 100),
    }
  }

  /**
   * 고정된 적경/적위(J2000)를 가진 별의 특정 시각·장소 기준 고도/방위.
   * 별은 지구에서 매우 멀어 J2000 좌표를 그대로 써도 세차운동의 영향(연간 약 0.014°)이
   * 이 앱의 고도 20° 임계값 판정에 미치는 오차는 무시할 수 있는 수준이다.
   * @returns {{altitudeDegrees: number, azimuthDegrees: number}}
   */
  function starAltAz(raHours, decDegrees, date, observer) {
    const hor = Horizon(date, observer, raHours, decDegrees, 'normal')
    return { altitudeDegrees: hor.altitude, azimuthDegrees: hor.azimuth }
  }

  /**
   * 오늘 밤의 항해박명(태양 고도 -12°) 시작~종료 시각을 찾는다.
   * 하드 게이트(§5.1)와 동일한 기준이라, 이 구간이 곧 "밤"으로 취급할 수 있는 시간대다.
   * @returns {{duskMs: number, dawnMs: number} | null} 찾지 못하면 null(예: 극지방 백야)
   */
  function nightWindow(date, observer) {
    const dusk = SearchAltitude(Body.Sun, observer, -1, date, 1, -12)
    if (!dusk) return null
    const dawn = SearchAltitude(Body.Sun, observer, 1, dusk, 1, -12)
    if (!dawn) return null
    return { duskMs: dusk.date.getTime(), dawnMs: dawn.date.getTime() }
  }

  return { makeObserver, sunAltitude, moonInfo, starAltAz, nightWindow }
}
