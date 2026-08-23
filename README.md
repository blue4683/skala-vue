# 프로젝트 수행 보고서

## 프로젝트 시작
- Node.js 설치
- Vue Extension 설치
- `npm create vue@3.22.3` 실행
    - TypeScript: No
    - JSX: No
    - Vue Router: Yes
    - Pinia: Yes
    - Vitest: No
    - ESLint: Yes
    - Prettier: Yes
- `npm install` -> `npm run dev`
- `localhost:5173` 확인

## API 연동(날씨 대시보드)

- 프로젝트 루트에 `.env` 생성
    - `.gitignore`에 `.env`가 들어있는지 확인
    - Vite는 `VITE_` 접두사가 붙은 변수만 클라이언트 번들에 넣음 -> 여기에 넣은 키는 브라우저에서 누구나 볼 수 있으므로 과금되는 키는 이렇게 사용 X

- `npm install axios element-plus @element-plus/icons-vue`
- `src/main.js`에 Element Plus를 등록


- API 호출 -> 정규화 -> composable -> 컴포넌트

```
api/weather.js          axios GET만 한다. 가공 안 함
      ↓
api/normalizeWeather.js API 응답 모양 → 우리 앱이 쓸 모양으로 변환
      ↓
composables/useWeather.js  loading/error/data 상태를 묶어 재사용 가능하게 만듦
      ↓
components/*.vue        API 필드명(`main.temp`, `sys.sunset`)을 몰라도 된다.
```

- 컴포넌트가 API 응답 구조를 직접 알면, 나중에 API를 바꾸거나 무료 -> 유료 엔드포인트로 옮길 때 화면 코드를 전부 고쳐야 하지만, 정규화 층을 하나 두었을 때 그 변경을 파일 하나로 끝낼 수 있음

- `useWeather.js`
    - `finally`에서 `loading = false` -> 성공하든 실패하든 로딩은 반드시 끝내야함
    - `load` 시작 시 `error = null` -> 이전 에러가 화면에 남아 있으면 안됨
    - `loadMock` -> API 키를 발급하기 전에 화면 작업을 진행하기 위한 함수

- composable: `use`로 시작하는 단순 함수. 내부에서 `ref`, `computed` 같은 Vue 반응형 API를 쓰고, 상태와 함수를 묶어 반환. **여러 컴포넌트가 같은 로직을 공유**할 때 사용

- `WeatherCard.vue`
    - `@click.stop` -> 이벤트 버블링을 막기 위해 설정

- `WeatherHomeView.vue`
    - `watch` vs `watchEffect`
        - watch는 감시 대상을 명시적으로 지정하지만 watchEffect는 콜백 안에서 읽은 값을 전부 자동으로 감시함
        - watch는 이전 값을 받을 수 있지만 watchEffect는 받지 못함
        - watch는 기본적으로 최초 실행을 하지 않고, watchEffect는 최초 즉시 1회 실행함
        - 바뀌기 전 값이 필요하면 watch, 아니라면 watchEffect를 사용하면 될 것 같음

- `WeatherDetailView.vue`
    - `route.params.cityId` -> `/weather/:cityId`의 `:cityId`가 여기로 들어옴
    - <component :is="weatherIcon" /> -> 렌더링할 컴포넌트를 값으로 결정, `v-if` 여러 개를 쓰는 대신 이 방식이 훨씬 짧음

## 상태 관리(Pinia)

- 문제 상황(props drilling): 온도 단위(℃/℉) 토글 버튼은 `App.vue` 헤더에 있고, 실제로 온도를 표시하는 곳은 `WeatherCard.vue` -> 그 사이의 `WeatherHomeView` / `BaseDashboardCard`는 `unit` 값에 관심이 없는데도 계속 props로 넘겨줘야 함

- `stores/counter.js` -> Pinia Setup Store 문법을 먼저 연습하기 위한 카운터 스토어
    - Setup Store는 `<script setup>`과 똑같은 모양: `ref`는 state, `computed`는 getter, 일반 함수는 action

- `stores/configStore.js` -> 실전 스토어. `unit` 값 하나만 담음
    - 기호(℃/℉)를 `unitSymbol`이라는 getter로 분리 -> 각 컴포넌트에서 `unit === 'celsius' ? '℃' : '℉'`를 반복하지 않아도 되고, 나중에 켈빈이 추가돼도 한 곳만 고치면 됨

- `WeatherCard.vue`
    - `displayTemp`는 원본 데이터(`props.city.temp`, 항상 섭씨)는 그대로 두고 **표시할 때만** 변환함 -> 스토어 값을 기준으로 매번 원본에서 다시 계산하므로 ℃↔℉ 토글을 여러 번 반복해도 반올림 오차가 누적되지 않음

- `UnitToggler.vue` -> `App.vue` 헤더에 배치하되 `route.path === '/'`(대시보드)일 때만 노출 -> 다른 화면에서는 의미 없는 버튼이라 조건부 렌더링

- 스토어에 넣지 않은 것: 검색어(`cityName`), `selectedCity`, `loading`/`error` -> 판단 기준은 "이 값이 서로 다른 화면/멀리 떨어진 컴포넌트에서 동시에 필요한가?"이고, 아니면 그냥 `ref`로 둠. 전역 상태는 늘리기는 쉽고 줄이기는 어려움

- 검증 중 `/weather/:cityId` 라우트가 `router/index.js`에 등록돼 있지 않아 상세 페이지로 진입이 안 되던 걸 발견 -> 라우트를 추가해서 "℉ 상태로 상세 페이지에 갔다 돌아와도 유지되는지"를 확인함

## 날씨 애니메이션 씬 (컴포넌트 분해)

- 이 단계의 주제는 애니메이션 자체가 아니라 **경계 설계**. `CloudLayer`가 `weather.clouds.all`, `wind.deg` 같은 API 응답 구조를 직접 알게 하면, API를 바꿀 때 컴포넌트를 전부 고쳐야 함

- `constants/sceneTuning.js` -> "풍속 15m/s에서 드리프트 최대"같은 취향값(매직넘버)을 전부 한 파일에 모음. 상수 옆에 단위(m/s, px 등)를 주석으로 적어둠

- `composables/useSceneParams.js` -> API 응답을 화면이 바로 쓸 수 있는 0~1 정규화 값으로 변환하는 번역 층
    - `toObservation`을 순수 함수로 export -> Vue와 무관해서 테스트하기 쉬움
    - `DEFAULT_OBS` -> 데이터가 없을 때 컴포넌트가 `undefined`를 만나지 않게 함
    - `clamp01` -> API가 이상한 값을 줘도 0~1을 벗어나지 않는다는 **계약**. 컴포넌트는 방어 코드 없이 0~1만 믿으면 됨

- `composables/useSunPath.js` -> 일출~일몰 진행도를 `Math.sin(p * Math.PI)` 한 줄로 반원 궤적(고도)으로 변환
    - 극지방 분기: 백야/극야에서는 응답에 `sunrise`/`sunset` 자체가 없음 -> 처리 안 하면 `NaN`으로 화면이 깨짐. "일어날 수 없는 경우"가 아니라 실제로 발생하는 케이스라서 분기 처리함

- `composables/useScrubTime.js` -> `scrubMs.value ?? nowMs.value` 한 줄로 "사용자가 시간을 움직였으면 그 시각, 아니면 현재 시각"을 표현 -> `isScrubbing` 같은 별도 플래그를 두지 않고 `null` 하나로 파생시킴

- `components/scene/*` -> 하늘(`SkyGradient`) → 해/달(`CelestialBody`) → 구름(`CloudLayer`) → 바다(`SeaLayer`) → 안개(`HazeOverlay`) 순서로 조립(`SceneStage.vue`)
    - SVG는 나중에 그린 게 위에 쌓이므로 레이어 순서 = 그리는 순서
    - 각 레이어는 자기가 반응할 값만 props로 받음(`params` 객체를 통째로 넘기지 않음)
    - `role="img"` + `aria-label`로 장면 전체를 한 문장으로 요약해 스크린 리더에 전달

- `components/scene/CloudLayer.vue` -> 같은 구름을 `x=0`, `x=1000` 두 벌 그리고 `translateX(-1000px) → 0`으로 움직여 이음매 없는 무한 스크롤을 구현. 세트 폭과 이동 거리가 정확히 같아야 반복이 끊겨 보이지 않음
    - `prefers-reduced-motion`을 감지해 애니메이션을 끔(전정기관 장애가 있는 사용자를 위한 배려)

- `components/scene/PrecipCanvas.vue` -> 비/눈 입자 수백 개는 CSS로 못 그려서 Canvas + `requestAnimationFrame` 사용
    - 파티클 배열은 의도적으로 `ref`가 아닌 plain 배열 -> 60fps로 반응성을 추적하면 프레임이 무너짐
    - `onMounted`에서 등록한 리스너/루프는 반드시 `onUnmounted`에서 해제(`cancelAnimationFrame`, `removeEventListener`) -> 안 하면 컴포넌트가 사라진 뒤에도 CPU를 계속 먹음
    - `visibilitychange`로 탭이 백그라운드일 때 애니메이션 정지 -> 배터리 절약
    - 화면 밖으로 나간 입자는 버리지 않고 위치만 재사용 -> GC 부담이 없음

- `components/SunArcScrubber.vue` -> 가이드 문서에 전체 코드가 없어서 직접 설계. `sunrise`~`sunset` 구간을 `el-slider`로 스크럽하고, 극지방 모드(`mode !== 'normal'`)일 때는 슬라이더 대신 안내 문구를 보여줌

- `views/WeatherView.vue` -> `mocks/*.json` 6종(맑음/비/폭풍/안개/극야/백야)을 버튼으로 전환하며 장면을 미리 볼 수 있게 조립. 폭풍/안개/극야 같은 상황은 실제로 기다릴 수 없으므로 목업 없이는 개발도 확인도 불가능함
    - `useWeather`의 `loadMock`은 정규화 층을 거치지 않고 `raw`에 그대로 꽂으므로, mock JSON은 API 원본이 아니라 **정규화된 이후의 모양**(`{ lat, lon, timezone, timezone_offset, data: [...] }`)으로 작성함
    - `/scene` 라우트로 등록하고 헤더 네비게이션에 "날씨 장면" 링크 추가

- "실시간 날씨 조회" 버튼을 테스트하다가 `api/weather.js`의 `BASE` URL에 꺾쇠괄호와 `.ord` 오타가 있어 실제 API 호출이 항상 실패하던 것, 그리고 `catch` 블록의 `throw`가 콤마 연산자로 묶여 있어 `Error` 대신 `{ cause }` 객체가 던져지던 것을 발견 -> 둘 다 수정함(Stage 3에서 이미 커밋된 코드라 별도 커밋으로 분리)

## 물때 트랙 (CORS · dev proxy · 단위 테스트)

- **CORS는 브라우저만의 규칙**. OpenWeatherMap은 브라우저에서 바로 호출됐지만 공공데이터포털(data.go.kr)은 `Access-Control-Allow-Origin` 헤더가 없어서 브라우저가 응답을 막음 -> 서버는 정상 응답했고, `curl`로는 잘 되는 이유가 여기 있음

- `vite.config.js`의 `server.proxy`로 `/khoa` 요청을 dev 서버가 대신 받아 `apis.data.go.kr`로 중계 -> 브라우저 입장에서는 같은 출처(`localhost:5173`)라 CORS 검사 자체를 안 함. **이 프록시는 `npm run dev`에서만 동작**하고 정적 빌드에는 없으므로 Stage 10에서 다시 다룸

- `api/khoaTide.js`
    - `decodeURIComponent(import.meta.env.VITE_KHOA_API_KEY)` -> data.go.kr이 주는 키가 이미 인코딩돼 있어도 axios가 params를 만들 때 **또** 인코딩해버리면 이중 인코딩으로 인증이 깨짐. 한 번 디코딩해두면 Encoding/Decoding 키 어느 쪽을 넣어도 동작함
    - `Array.isArray(item) ? item : [item]` -> 이 API는 결과가 1개면 배열이 아니라 객체 하나를 줌. 공공 API에서 흔한 함정
    - `resultCode !== '00'`을 직접 검사 -> HTTP 200이어도 실패일 수 있어서 axios의 `catch`만 믿으면 안 됨
    - `catch`에서 `axios.isAxiosError(e)`로 네트워크 에러와 `normalizeTideResponse`가 던진 검증 에러(이미 좋은 메시지를 가짐)를 구분해서, 후자는 덮어쓰지 않고 그대로 전달

- `utils/tideCurve.js` -> 고/저조 극점(하루 4개 안팎) 사이를 **반주기 코사인**으로 보간해 연속 곡선을 만듦(`mid + amp * cos(π·ratio)`) -> 양 끝에서 정확히 극점 값과 일치하면서, 직선 보간과 달리 극점에서 꺾이지 않고 조석의 물리적 성질(사인파에 가까움)을 반영함
    - `withTideSlope`로 조위의 시간당 변화율(cm/h)을 계산 -> "물이 얼마나 높은가"보다 "얼마나 세게 흐르는가"가 낚시에는 더 중요함
    - Vue와 무관한 순수 함수라서 `tideCurve.test.js`로 브라우저 없이 테스트(경계값/수학적 성질/이상 입력 3종) -> 이 프로젝트에서 처음 쓰는 단위 테스트. `npm run test:unit`으로 실행(Vitest 설치 및 스크립트 추가)

- `utils/conditionBands.js` -> "낚시 점수 87점" 같은 점수화 대신, 규칙을 만족하는 구간만 밴드로 표시 -> 가중치 합산은 근거를 설명할 수 없지만 "이 구간이 왜 강조됐는가"는 규칙만으로 항상 답할 수 있음
    - `strongFlowRule`은 **상대 기준**(그 지점 최대 slope의 60%)을 씀 -> 조차가 지점마다 크게 달라서(인천 ~800cm vs 부산 ~100cm) 고정 임계값이면 한쪽은 항상 걸리고 한쪽은 전혀 안 걸림

- `composables/useTide.js` -> 전날/당일/다음날 **3일치를 병렬로(`Promise.all`) 이어붙여** 로딩 -> 하루치만 부르면 그날 첫 극점 이전/마지막 극점 이후가 보간 불가(`null`)라 곡선 양 끝이 잘림

- `components/TideTrack.vue` -> `xAt`/`yAt` 두 함수에 데이터→SVG 좌표 변환을 몰아넣음(차트 라이브러리가 하는 일의 대부분이 이것). `setPointerCapture`로 드래그 중 커서가 SVG 밖으로 나가도 튀지 않게 하고, `role="slider"` + `aria-value*` + ←/→ 키(15분 이동)로 마우스 없이도 조작 가능하게 함

- `views/WeatherView.vue` -> `sceneWithSea = { ...scene, seaLevel: normalizedLevelAt(targetMs) }`로 Stage 5의 `SeaLayer`(그때는 `seaLevel`이 없어 렌더링되지 않던)를 실제로 움직이게 연결. 조석 차트를 드래그하면 씬의 해수면과 태양 위치가 `targetMs` 하나로 동시에 움직임
    - `mocks/tide/*.json` 6개(인천/부산 × 전날/당일/다음날)는 KHOA 원본 응답 형태 그대로 작성 -> `loadTideMock`은 `normalizeTideResponse`를 거치므로 weather mock과 달리 **정규화 전** 모양이어야 함

## 해안 지도 (지리 시각화 · 규칙 기반 판정)

- **점수화하지 않는다** 원칙을 전면 적용: "낚시 적합도 87점" 대신 `open`/`caution`/`blocked`/`nodata` 4단계로만 분류 -> 가중치는 근거를 설명할 수 없지만 "왜 이 색인가"는 규칙만으로 항상 답할 수 있음. 우선순위도 코드 순서로 드러남(데이터 없음 → 특보 → 규칙 미충족 → 통과)

- `utils/grid.js` -> 기상청 단기예보는 위경도가 아니라 Lambert Conformal Conic 격자(nx, ny)를 씀. 공식은 기상청이 공개한 것을 그대로 옮기되, **남의 공식을 옮겼을 때는 알려진 정답 한 쌍으로 검증**한다는 원칙에 따라 `grid.test.js`에서 "서울시청 → nx:60, ny:127"로 테스트함

- `utils/baseTime.js` -> 단기예보는 하루 8번 발표(02·05·08·...·23시)되고 발표 후 10분 뒤부터 조회 가능 -> `now = new Date()`를 기본 인자로 빼서 테스트 시 특정 시각을 주입할 수 있게 함, 00~02시에는 전날 23시 발표분으로 넘어가는 자정 처리 포함

- `api/kmaForecast.js` -> 응답이 (시각, 항목, 값) **롱포맷**이라 `Map`으로 시각을 키잉해 한 번의 순회로 와이드포맷(`{time, TMP, WSD, WAV, ...}`)으로 피벗함(배열 `find`로 하면 O(n²))

- `scripts/build-segments.mjs` -> 해안 지명 31곳의 격자 좌표를 **빌드타임에 한 번** 계산해 `public/map/segments.json`으로 구움. 해안선 폴리곤에서 자동 추출하는 대신 사람이 아는 지명 좌표를 손으로 큐레이션 -> "일회성 작업에 추상화 계층을 만들지 않는다" 원칙의 실제 사례. `node scripts/build-segments.mjs`로 재생성

- `mocks/kma/forecast.js` -> `Math.random()` 대신 `Math.sin(seed)*10000`의 소수부를 쓰는 시드 난수로 목업 예보 생성 -> 새로고침마다 지도 색이 바뀌면 "코드 수정 때문인지 그냥 랜덤인지" 구분이 안 됨. 격자당 ~8% 확률로 `nodata`도 섞어서 정상 케이스만으로는 테스트 못 하는 예외 처리를 검증함

- `utils/segmentState.js` -> 20줄. `!fc → nodata` → `warns.length → blocked` → `규칙 미충족 → caution` → `open` 순서 그대로가 우선순위. `reason` 배열을 함께 반환해 "왜 이 판정인가"를 텍스트로 보여줌

- `data/rules.js` -> 판정 규칙을 `if`문 대신 배열(데이터)로 뺌 -> 사용자가 개별 토글할 수 있고, `label`이 그대로 툴팁 설명이 되고, 새 모드는 `RULES.xxx`만 추가하면 됨

- `composables/useCoastalData.js` -> 구간은 31개지만 격자는 그보다 적음(인접 구간이 같은 5km 격자에 들어감) -> `new Map(segments.map(s => [\`${nx},${ny}\`, grid]))`로 문자열 키 dedupe 후 한 번만 조회. 공공 API 일일 호출 제한이 있어 중복 호출은 실제 비용임
    - 이번 세션은 KMA 인증키 승인 절차 없이 진행해 `buildMockForecast`를 기본으로 사용(가이드 원본 코드도 동일한 선택). 실제 API 전환은 `fetchVillageForecast` 호출 한 줄로 교체 가능하도록 주석으로 남겨둠

- `composables/useSegmentStates.js` -> 구간×시각 2차원 상태 테이블을 `computed`로 **사전 계산**(31구간 × 17시각 = 527칸). 슬라이더를 움직일 때마다 재계산하면 드래그가 버벅이므로, 이동은 배열 인덱싱만 하게 함

- `components/KoreaMap.vue` -> `geoMercator().fitSize()`로 GeoJSON을 자동 스케일/이동. `projection([lon, lat])`처럼 **경도, 위도 순서**로 넘겨야 함(우리 `segments.json`은 `[lat, lon]`이라 뒤집어서 넘김) -> 순서를 틀리면 한반도가 태평양 한가운데로 감
    - 색만으로 정보를 전달하지 않도록 3중 장치: `<title>`(스크린 리더용 사유 텍스트), `nodata`의 점선 테두리, 적록색약도 구분 가능한 청록/황토/자주 배색
    - **지도 데이터 디버깅**: `public/map/korea-coast.json`(통계청 SGIS 시도 경계, 공공누리 제1유형, mapshaper로 단순화)을 처음 붙였을 때 지도가 아예 안 보이고 점 하나만 찍히는 문제가 있었음 -> 원인은 폴리곤 링의 방향(winding order)이 d3-geo가 기대하는 방향과 반대라서, d3가 "한국"이 아니라 "한국을 제외한 지구 전체"로 해석해 `fitSize`의 스케일이 완전히 어긋난 것. `@mapbox/geojson-rewind`로 방향을 교정해 해결함

- `components/TimeSlider.vue` -> `TideTrack`과 달리 **네이티브 `<input type="range">`**를 씀. 값이 연속(임의 시각)이 아니라 이산(3시간 슬롯 17개)이라 커브 위 커서 같은 요구가 없고, 네이티브로 되는 걸 직접 만들 이유가 없음(키보드·터치·스크린 리더가 공짜). `update:modelValue`라는 표준 이름을 emit해 `v-model` 한 줄로 연결됨

- `views/CoastalMapView.vue` -> 뷰가 40줄이 안 됨. 계산은 전부 composable/utils에 있고 뷰는 조립·표시만 함(Stage 3부터 지켜온 층 분리) -> `/map` 라우트로 등록하고 헤더에 "해안 지도" 링크 추가

- `d3-geo`만 설치(`d3` 전체가 아님) -> d3는 30개 넘는 모듈 묶음인데 투영 기능만 필요해서 번들 크기를 줄임

## ESLint · Prettier · oxlint

- 세 도구의 역할이 다름: Prettier는 **포맷팅**(모양), ESLint는 **정적 분석**(의미, 안 쓰는 변수·`v-for` key 누락 등), oxlint는 ESLint와 같은 검사를 Rust로 훨씬 빠르게. `eslint-config-prettier`로 ESLint의 포맷팅 규칙을 꺼서 둘이 서로 되돌리는 무한루프를 막음
    - `npm create vue@latest`가 이미 `eslint.config.js`/`.oxlintrc.json`/`.prettierrc.json`/`jsconfig.json`을 가이드와 동일하게 생성해둔 상태라 이 단계는 설정을 새로 만들기보다 **실제로 작동하는지 검증**하는 데 집중함

- `npm run lint` 실행 중 oxlint에서 148개, ESLint에서 43개 에러가 쏟아졌는데 전부 우리 코드가 아니라 프로젝트 루트의 `.vite/`(Vite dev 서버 캐시) 안에 있는 vue/pinia/vue-router 번들 코드였음 -> 원인은 `.vite/`가 `.gitignore`에 없어서 **git에 실수로 커밋**돼 있었고, 캐시 디렉터리라 린터의 기본 제외 대상도 아니었던 것
    - `.gitignore`에 `.vite` 추가 + `git rm -r --cached`로 추적 해제 + 로컬 캐시 삭제(재생성 가능) + `eslint.config.js`의 `globalIgnores`에도 `**/.vite/**` 추가(재생성돼도 다시 걸리지 않도록 이중 방어)
    - 이후 `npm run lint`는 0 에러로 통과

- 일부러 `unused` 변수와 `v-for` key 누락 코드를 만들어 `npx eslint`로 실제로 잡히는지 확인(`no-unused-vars`, `vue/require-v-for-key`) -> 확인 후 파일은 삭제

- `npm run format` 실행 결과는 로직 변경 없이 줄바꿈/들여쓰기 같은 포맷팅만 반영됨(가이드 코드 스니펫을 그대로 옮기며 Prettier를 거치지 않았던 파일들이 정리됨)