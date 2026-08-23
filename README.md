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