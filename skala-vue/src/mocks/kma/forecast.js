// 기상청 API 키 승인 전까지 쓰는 목업 예보 생성기.
// 격자(nx,ny)·시간대별로 결정적(seeded)인 값을 만들어, 새로고침해도 지도 색이 흔들리지 않게 한다.

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function gridTimeSeed(nx, ny, timeIndex, salt) {
  return nx * 1000 + ny + timeIndex * 97 + salt
}

/**
 * @param {Array<{nx: number, ny: number}>} grids
 * @param {number[]} timeSlots epoch ms, 오름차순
 * @returns {Map<string, Array<object|null>>} `${nx},${ny}` → 예보 배열(null=nodata)
 */
export function buildMockForecast(grids, timeSlots) {
  const table = new Map()

  for (const { nx, ny } of grids) {
    const rows = timeSlots.map((_, i) => {
      // 격자당 ~8% 확률로 해당 시각 응답 없음(nodata)을 시뮬레이션
      if (seededRandom(gridTimeSeed(nx, ny, i, 0.9)) < 0.08) return null

      const r1 = seededRandom(gridTimeSeed(nx, ny, i, 0.1))
      const r2 = seededRandom(gridTimeSeed(nx, ny, i, 0.2))
      const r3 = seededRandom(gridTimeSeed(nx, ny, i, 0.3))
      const r4 = seededRandom(gridTimeSeed(nx, ny, i, 0.4))

      return {
        WAV: Math.round(r1 * 2.4 * 10) / 10,
        WSD: Math.round(r2 * 10 * 10) / 10,
        VEC: Math.round(r3 * 360),
        POP: Math.round(r4 * 100),
        PTY: r4 > 0.85 ? 1 : 0,
        TMP: Math.round(20 + r1 * 10),
        SKY: r2 > 0.7 ? 4 : r2 > 0.4 ? 3 : 1,
      }
    })
    table.set(`${nx},${ny}`, rows)
  }

  return table
}
