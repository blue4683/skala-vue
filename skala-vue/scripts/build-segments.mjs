// 해안 구간 메타데이터를 빌드타임에 한 번 계산해 public/map/segments.json으로 굽는다.
//
// 해안선 폴리곤 자동 추출 대신, 실제 해안 지명 좌표를 수동으로 큐레이션한다.
// 격자 변환은 grid.js로 실제 계산하므로 nx/ny는 근사값이 아니다.
//
// 실행: node scripts/build-segments.mjs

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { toGrid } from '../src/utils/grid.js'

const COASTAL_POINTS = [
  // 동해안 (북 → 남)
  { name: '강원 고성', lat: 38.47, lon: 128.45 },
  { name: '강원 속초', lat: 38.207, lon: 128.5918 },
  { name: '강원 양양', lat: 38.0754, lon: 128.6289 },
  { name: '강원 강릉', lat: 37.7519, lon: 128.8761 },
  { name: '강원 동해', lat: 37.5247, lon: 129.1143 },
  { name: '경북 울진', lat: 36.993, lon: 129.4003 },
  { name: '경북 영덕', lat: 36.415, lon: 129.365 },
  { name: '경북 포항', lat: 36.019, lon: 129.3435 },
  { name: '울산 동구', lat: 35.504, lon: 129.417 },
  // 남해안 (동 → 서)
  { name: '부산 해운대', lat: 35.1587, lon: 129.1604 },
  { name: '부산 다대포', lat: 35.049, lon: 128.969 },
  { name: '경남 거제', lat: 34.8806, lon: 128.6211 },
  { name: '경남 통영', lat: 34.8544, lon: 128.4331 },
  { name: '경남 남해', lat: 34.8375, lon: 127.8925 },
  { name: '전남 여수', lat: 34.7604, lon: 127.6622 },
  { name: '전남 고흥', lat: 34.6113, lon: 127.2848 },
  { name: '전남 완도', lat: 34.311, lon: 126.755 },
  { name: '전남 진도', lat: 34.488, lon: 126.263 },
  { name: '전남 목포', lat: 34.7936, lon: 126.3886 },
  // 서해안 (남 → 북)
  { name: '전북 군산', lat: 35.9678, lon: 126.6367 },
  { name: '충남 보령', lat: 36.332, lon: 126.513 },
  { name: '충남 태안', lat: 36.7455, lon: 126.2977 },
  { name: '충남 서산', lat: 36.901, lon: 126.34 },
  { name: '경기 화성', lat: 37.193, lon: 126.618 },
  { name: '경기 안산', lat: 37.21, lon: 126.58 },
  { name: '인천', lat: 37.4563, lon: 126.6252 },
  { name: '인천 강화', lat: 37.7465, lon: 126.488 },
  // 제주
  { name: '제주 제주시', lat: 33.5097, lon: 126.5219 },
  { name: '제주 애월', lat: 33.4636, lon: 126.321 },
  { name: '제주 서귀포', lat: 33.253, lon: 126.56 },
  { name: '제주 성산', lat: 33.4586, lon: 126.9422 },
]

const segments = COASTAL_POINTS.map((p, i) => ({
  id: `seg-${String(i + 1).padStart(3, '0')}`,
  name: p.name,
  midpoint: [p.lat, p.lon],
  grid: toGrid(p.lat, p.lon),
}))

const outPath = fileURLToPath(new URL('../public/map/segments.json', import.meta.url))
writeFileSync(outPath, JSON.stringify(segments, null, 2) + '\n')
console.log(`${segments.length}개 구간 → ${outPath}`)
