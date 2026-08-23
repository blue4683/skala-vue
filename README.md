# 별 관측 지도

전 세계 별 관측 후보 도시의 날씨와 광공해, 달빛, 시정을 비교해 오늘 밤 관측하기 좋은 장소와 시간을 찾는 Vue 애플리케이션입니다. 지도에서 관측 조건과 별자리를 확인하고, 같은 도시의 현재 날씨를 대시보드와 상세 페이지에서 살펴볼 수 있습니다.

## 주요 화면

| 경로               | 화면           | 설명                                                                       |
| ------------------ | -------------- | -------------------------------------------------------------------------- |
| `/`                | 별 관측 지도   | 17개 관측 후보 도시의 추천 점수, 광공해, 구름 상태를 비교합니다.           |
| `/dashboard`       | 날씨 대시보드  | 관측 지도와 동일한 도시를 검색하고 현재 날씨를 비교합니다.                 |
| `/weather/:cityId` | 도시 날씨 상세 | 선택한 도시의 기온, 습도, 구름, 바람, 가시거리, 강수량, 기압을 보여줍니다. |
| `/about`           | 서비스 소개    | 홈페이지의 목적과 주요 기능을 간략히 설명합니다.                           |

## 핵심 기능

### 별 관측 지도

- MapLibre GL JS 기반 전 세계 지도와 17개 관측 후보 도시
- 관측 추천, 광공해, 구름 레이어 전환
- 도시별 현지 시간대를 반영한 오늘 밤 관측 시간 선택
- 광공해, 구름, 달빛, 시정, 기온과 풍속을 근거로 한 관측 점수
- 추천 시간대와 점수 산정 근거 표시
- Astronomy Engine을 이용한 별자리 고도·방위 계산
- 선택한 시각에 지평선 위에 있는 별자리만 표시
- 고정된 지도·정보 영역과 정보 패널 내부 스크롤

지도 마커의 추천 점수는 각 도시의 오늘 밤 기본 관측 시각을 기준으로 비교합니다. 도시를 선택한 뒤 시간 리본을 변경하면 해당 도시의 상세 점수와 별자리 정보가 선택한 시각에 맞춰 갱신됩니다.

### 날씨 대시보드

- 별 관측 지도와 동일한 17개 도시의 OpenWeather 현재 날씨 조회
- 한국어·영문 도시명, 국가, 지역, 인근 관측지 검색
- 섭씨·화씨 단위 전환
- 기온, 습도, 구름량, 날씨 상태와 불쾌지수 비교
- 도시별 상세 페이지 이동
- 일부 도시 API 요청이 실패해도 성공한 도시 정보는 유지

### 도시 날씨 상세

- 현재 기온과 체감 기온
- 습도와 구름량
- 풍속과 풍향
- 가시거리와 최근 1시간 강수량
- 해면 기압
- 도시 좌표, 고도, 시간대와 인근 관측 지역

OpenWeather 응답에 포함되지 않은 선택 항목은 화면에서 빈 값으로 안전하게 처리합니다.

## 데이터 출처

| 용도                  | 데이터                          | 비고                                                                |
| --------------------- | ------------------------------- | ------------------------------------------------------------------- |
| 별 관측용 시간별 날씨 | Open-Meteo Forecast API         | 구름, 강수, 시정, 풍속, 기온을 사용하며 API 키가 필요하지 않습니다. |
| 날씨 대시보드·상세    | OpenWeather Current Weather API | `VITE_OWM_API_KEY`가 필요합니다.                                    |
| 광공해                | VIIRS 월간 야간광 ImageServer   | 좌표별 원시 복사휘도를 상대 어두움 점수로 변환합니다.               |
| 태양·달·별 위치       | Astronomy Engine                | 관측 위치와 시각을 기준으로 고도와 방위를 계산합니다.               |

VIIRS 값은 위성에서 관측한 상향 복사휘도입니다. 지상의 Bortle 등급이나 SQM 실측값과 동일하지 않으므로 장소 간 상대 비교 용도로만 사용합니다. 관측 점수 역시 실제 관측 가능성을 보장하는 값이 아니며 현장 기상과 접근 조건을 함께 확인해야 합니다.

## 기술 스택

- Vue 3, Vue Router, Pinia
- Vite
- Element Plus
- MapLibre GL JS
- Astronomy Engine
- Axios
- Vitest
- ESLint, Oxlint, Prettier

## 시작하기

요구 환경은 Node.js `20.19 이상` 또는 `22.12 이상`입니다.

```bash
cd skala-vue
npm install
```

`skala-vue/.env` 파일을 만들고 OpenWeather API 키를 설정합니다.

```dotenv
VITE_OWM_API_KEY=your_openweather_api_key
```

Vite의 `VITE_` 접두사 환경변수는 클라이언트 번들에 포함되어 브라우저에서 확인할 수 있습니다. 운영 환경에서는 키 사용량과 허용 도메인을 제한하고, 비공개로 유지해야 하는 키는 별도 서버에서 관리해야 합니다.

개발 서버를 실행합니다.

```bash
npm run dev
```

기본 주소는 `http://localhost:5173`입니다.

## 명령어

```bash
npm run dev        # 개발 서버
npm run build      # 프로덕션 빌드
npm run preview    # 빌드 결과 미리보기
npm run test:unit  # 단위 테스트
npm run lint       # ESLint와 Oxlint 검사
npm run format     # Prettier 포맷 적용
```

## 주요 구조

```text
skala-vue/
├── src/
│   ├── api/
│   │   ├── weather.js              # OpenWeather 현재 날씨 요청
│   │   ├── stargazingWeather.js    # Open-Meteo 관측용 예보 요청
│   │   ├── lightPollution.js        # VIIRS 야간광 요청
│   │   └── normalizeWeather.js      # 날씨 응답 정규화
│   ├── components/
│   │   ├── exercise/                # 날씨 대시보드 컴포넌트
│   │   └── stargazing/              # 지도, 시간 선택, 관측 상세 컴포넌트
│   ├── composables/
│   │   ├── useGlobalCityWeather.js  # 도시별 현재 날씨 공용 상태
│   │   ├── useStargazingSites.js    # 관측 도시 실데이터 로딩
│   │   ├── useObservationScore.js   # 관측 조건 평가
│   │   └── useAstronomy.js          # 천체 위치 계산
│   ├── data/                         # 도시와 별자리 기준 데이터
│   ├── utils/                        # 점수와 별자리 가시성 순수 함수
│   └── views/                        # 현재 라우트 화면
├── vite.config.js                    # 개발 프록시와 Vite 설정
└── vercel.json                       # 배포 프록시와 SPA fallback
```

API 응답은 화면에서 직접 사용하지 않고 `api → 정규화 → composable → component` 순서로 전달합니다. 외부 API 형식과 화면 모델을 분리해 데이터 공급자가 변경되어도 수정 범위를 줄입니다.

## 테스트

다음 로직을 중심으로 단위 테스트를 구성했습니다.

- OpenWeather 응답 정규화와 날씨 상태 코드 변환
- 여러 도시 날씨 요청의 전체 성공·부분 실패 처리
- 관측 점수의 하드 게이트와 가중치 계산
- 추천 관측 시간 구간 계산
- 별자리 가시성과 지평선 아래 별자리 제외
- Open-Meteo와 VIIRS 응답 처리

```bash
cd skala-vue
npm run test:unit
```

## 배포

Vercel에서 저장소를 연결할 때 Root Directory를 `skala-vue`로 지정하고 `VITE_OWM_API_KEY`를 환경변수로 등록합니다. `vercel.json`은 VIIRS 요청 프록시와 Vue Router의 SPA fallback을 제공합니다.

배포 전에는 다음 명령으로 프로덕션 빌드를 확인합니다.

```bash
cd skala-vue
npm run test:unit
npm run lint
npm run build
```
