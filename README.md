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