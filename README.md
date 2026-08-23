# 별 관측 지도

전 세계 별 관측 후보 도시의 날씨와 광공해, 달빛, 시정을 비교해 오늘 밤 관측하기 좋은 장소와 시간을 찾는 Vue 애플리케이션입니다. 지도에서 관측 조건과 별자리를 확인하고, 같은 도시의 현재 날씨를 대시보드와 상세 페이지에서 살펴볼 수 있습니다.

## 구현 방식과 기술 선택 이유

### Modern JavaScript

- 배열 메서드와 객체 구조 분해, 스프레드 문법을 사용해 도시 목록과 API 응답을 가공하도록 구성함.
- Optional Chaining과 Nullish Coalescing을 사용해 외부 응답의 선택 필드가 누락되어도 화면이 중단되지 않도록 처리했음.
- Promise와 `async/await`를 사용해 외부 데이터 요청의 성공, 실패, 로딩 종료 흐름을 순서대로 처리하도록 구성함.

### Vue 프로젝트 구성과 기본 문법

- Vite 기반 Vue 3 프로젝트와 SFC 구조를 사용해 화면의 template, script, style을 기능 단위로 관리하도록 구성함.
- 보간법과 `v-bind`, `v-if`, `v-for`, `v-on`, `v-model`을 사용해 상태에 따라 화면과 사용자 입력이 자동으로 연결되도록 구현했음.
- 컴포넌트별 스타일 충돌을 줄이기 위해 `<style scoped>`를 적용하고, 공통 색상과 간격은 CSS 변수로 관리하도록 구성함.

### Composition API

- 검색어, 선택 도시, 관측 시각처럼 변경되는 값은 `ref`로 관리하도록 구성함.
- 검색 결과, 상태 문구, 관측 점수처럼 기존 상태에서 계산되는 값은 `computed`로 정의해 불필요한 중복 계산을 줄였음.
- 선택값 변경에 따른 후속 처리는 `watch`, 화면 진입 시 필요한 초기 API 요청은 `onMounted`에서 실행하도록 구성함.
- 여러 화면에서 사용하는 반응형 상태와 로딩 로직은 composable로 분리해 동일한 로직을 중복 작성하지 않도록 했음.

### Vue Components

- [WeatherHomeView.vue](skala-vue/src/views/WeatherHomeView.vue)가 검색과 선택 상태를 관리하고, 화면 요소는 [BaseDashboardCard.vue](skala-vue/src/components/exercise/BaseDashboardCard.vue), [SearchBar.vue](skala-vue/src/components/exercise/SearchBar.vue), [WeatherCard.vue](skala-vue/src/components/exercise/WeatherCard.vue)로 분리하도록 구성함.
- 부모에서 자식으로 전달하는 값은 `props`, 자식에서 발생한 사용자 동작은 `emits`로 전달해 단방향 데이터 흐름을 유지했음.
- 공통 카드의 내부 내용은 `slot`으로 주입해 검색 영역과 날씨 목록에서 같은 레이아웃을 재사용하도록 구성함.

### Vue Router

- 지도, 대시보드, 도시 상세, 서비스 소개 화면을 서로 다른 주소로 직접 접근할 수 있도록 Vue Router를 적용했음.
- [router/index.js](skala-vue/src/router/index.js)에서 화면 컴포넌트를 지연 로딩해 초기 로드에 필요한 코드만 내려받도록 구성함.
- `/weather/:cityId` 동적 경로와 `router.push()`, `useRoute()`를 사용해 하나의 상세 화면을 여러 도시에 재사용하도록 구현했음.

### Pinia

- 대시보드와 상세 화면에서 동일한 섭씨·화씨 설정을 사용하기 위해 [configStore.js](skala-vue/src/stores/configStore.js)에 전역 상태를 구성함.
- 단위 값, 단위 기호, 단위 변경 동작을 각각 상태, 계산된 값, 액션 역할로 분리했음.
- 컴포넌트 계층을 따라 설정값을 반복해서 전달하지 않고 필요한 화면에서 저장소를 직접 사용하도록 구성함.

### Axios

- 쿼리 파라미터 전달과 오류 판별 방식을 API 모듈마다 일관되게 유지하기 위해 Axios를 사용했음.
- API 응답을 화면에서 직접 사용하지 않고 `api -> 정규화 -> composable -> component` 순서로 전달하도록 구성함.
- 공급자마다 다른 필드명과 선택값 누락은 정규화 단계에서 화면 모델로 변환해 컴포넌트가 외부 API 형식에 종속되지 않도록 했음.

### UI Library

- 검색 입력, 카드, 버튼, 알림, 빈 결과, 로딩 스켈레톤을 일관된 형태로 제공하기 위해 Element Plus를 적용했음.
- 공통 UI 동작은 라이브러리 컴포넌트를 사용하고, 프로젝트 고유의 색상과 레이아웃은 scoped CSS로 조정하도록 구성함.
- [main.js](skala-vue/src/main.js)에서 한국어 locale과 함께 전역 등록해 모든 화면에서 동일한 설정을 사용하도록 했음.

### Vite Build & Deployment

- `@` 별칭을 사용해 깊은 상대 경로 대신 `src` 기준으로 모듈을 가져오도록 구성함.
- `VITE_` 환경변수로 API 설정을 소스코드와 분리하고, 개발 환경과 배포 환경에서 같은 참조 방식을 사용하도록 했음.
- lint, format, build 명령을 분리해 코드 품질 확인과 프로덕션 번들 생성을 반복 실행할 수 있도록 구성함.

## 추가 학습으로 확장한 기능

### 지도와 빌드 자산

- 관측 후보지의 분포와 지역 간 차이를 지도에서 비교하기 위해 [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/)를 추가로 학습해 도시 마커와 추천·광공해·구름 레이어를 구현했음.
- 운영 빌드에서도 지도가 동작하도록 [Vite Plugin API](https://vite.dev/guide/api-plugin.html)와 [MapLibre CSP·Worker 설정](https://maplibre.org/maplibre-gl-js/docs/#csp-directives)을 참고해 Worker 파일을 별도 자산으로 내보내도록 구성함.

### 천문 계산과 관측 점수

- 관측자의 위치와 시각을 기준으로 태양·달·별의 고도와 방위를 계산하기 위해 [Astronomy Engine JavaScript API](https://github.com/cosinekitty/astronomy/blob/master/source/js/README.md)를 추가로 학습했음.
- 태양 고도로 밤의 범위를 찾고, 달빛·광공해·구름·시정·기온·풍속을 조합해 관측 점수를 계산하도록 구성함.
- 천문 계산 결과와 화면 표시 규칙이 섞이지 않도록 별자리 가시성과 점수 계산을 순수 함수로 분리했음.

### 외부 데이터와 브라우저 캐시

- 현재 날씨만으로 오늘 밤의 관측 조건을 판단하기 어려워 [Open-Meteo Forecast API](https://open-meteo.com/en/docs)의 시간별 구름, 강수, 시정, 풍속, 기온 예보를 추가했음.
- [ArcGIS Image Service Identify](https://developers.arcgis.com/rest/services-reference/enterprise/identify-image-service/)로 최신 VIIRS 월간 야간광을 조회하고 장소 간 비교용 상대 어두움 점수로 변환하도록 구성함.
- 여러 요청 중 일부가 실패해도 성공한 결과를 유지하기 위해 [`Promise.allSettled()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)를 적용했음.
- 중복 호출과 요청 제한의 영향을 줄이기 위해 [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)로 Open-Meteo 응답을 30분간 캐싱하도록 구성함.

### 테스트와 배포 프록시

- 관측 점수, 추천 시간, 별자리 가시성, 날씨 응답 변환의 정상·실패 입력을 검증하기 위해 [Vitest](https://vitest.dev/guide/) 단위 테스트를 추가했음.
- 브라우저에서 직접 호출할 수 없는 외부 서비스는 개발 환경에서 [Vite `server.proxy`](https://vite.dev/config/server-options.html#server-proxy)를 사용하도록 구성함.
- 배포 환경에서는 [Vercel Rewrites](https://vercel.com/docs/routing/rewrites)로 외부 API를 프록시하고, [Vite SPA 배포 설정](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas)으로 동적 주소 새로고침을 처리하도록 구성함.

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
- Open-Meteo 예보를 30분간 브라우저에 캐싱하고 요청 제한 시 수집 시각과 함께 저장된 데이터 표시

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
│   ├── router/                       # 화면 경로와 지연 로딩 설정
│   ├── stores/                       # Pinia 전역 상태
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
