<script setup>
import { computed, ref } from 'vue'
import { Location } from '@element-plus/icons-vue'
import { useWeather } from '@/composables/useWeather'
import { useScrubTime } from '@/composables/useScrubTime'
import { useSunPath } from '@/composables/useSunPath'
import { useSceneParams } from '@/composables/useSceneParams'
import { useTide } from '@/composables/useTide'
import { buildTideSeries, withTideSlope } from '@/utils/tideCurve'
import { buildBands, strongFlowRule } from '@/utils/conditionBands'
import SceneStage from '@/components/scene/SceneStage.vue'
import SunArcScrubber from '@/components/SunArcScrubber.vue'
import TideTrack from '@/components/TideTrack.vue'
import StationPicker from '@/components/StationPicker.vue'

import clearMock from '@/mocks/clear.json'
import rainMock from '@/mocks/rain.json'
import stormMock from '@/mocks/storm.json'
import foggyMock from '@/mocks/foggy.json'
import polarNightMock from '@/mocks/polar-night.json'
import mcmurdoPolarDayMock from '@/mocks/mcmurdo-polar-day.json'

import stationsData from '@/data/stations.json'
import incheonDayPrev from '@/mocks/tide/incheon-2026-08-20.json'
import incheonDayToday from '@/mocks/tide/incheon-2026-08-21.json'
import incheonDayNext from '@/mocks/tide/incheon-2026-08-22.json'
import busanDayPrev from '@/mocks/tide/busan-2026-08-20.json'
import busanDayToday from '@/mocks/tide/busan-2026-08-21.json'
import busanDayNext from '@/mocks/tide/busan-2026-08-22.json'

const { raw, loading, error, load, loadMock } = useWeather()
const { targetMs, isScrubbing, scrubTo, reset } = useScrubTime()
const {
  extrema: tideExtrema,
  rangeStart: tideRangeStart,
  rangeEnd: tideRangeEnd,
  tidalRange,
  loading: tideLoading,
  error: tideError,
  normalizedLevelAt,
  load: loadTide,
  loadMock: loadTideMock,
} = useTide()

const current = computed(() => raw.value?.data?.[0] ?? null)

const time = useSunPath(current, targetMs)
const scene = useSceneParams(current, time)

const sceneWithSea = computed(() => ({
  ...scene.value,
  seaLevel: tideExtrema.value.length ? normalizedLevelAt(targetMs.value) : null,
}))

// STEP 8 — 관측소 전환. KHOA 키가 없어 obsCode별 mock을 그대로 불러온다.
const stations = stationsData.stations
const TIDE_MOCKS = {
  DT_0001: [incheonDayPrev, incheonDayToday, incheonDayNext],
  DT_0005: [busanDayPrev, busanDayToday, busanDayNext],
}
const selectedStation = ref(stations[0])

function selectStation(station) {
  selectedStation.value = station
  lat.value = station.lat
  lon.value = station.lon
  loadTideMock(TIDE_MOCKS[station.obsCode])
}

function fetchLiveTide() {
  loadTide(selectedStation.value.obsCode)
}

// STEP 9 — 조건 밴드(§6). hourly 날씨가 없어 시간에 따라 실제로 변하는 신호는
// 조위 변화율뿐이라, 이 밴드 하나만 토글로 노출한다.
const showFlowBand = ref(true)

const tideSeriesWithSlope = computed(() =>
  withTideSlope(buildTideSeries(tideExtrema.value, tideRangeStart, tideRangeEnd)),
)

const flowBands = computed(() => {
  if (!showFlowBand.value || !tideSeriesWithSlope.value.length) return []
  return buildBands(tideSeriesWithSlope.value, [strongFlowRule(tideSeriesWithSlope.value)])
})

const mocks = [
  { key: 'clear', label: '맑음 · 서울', data: clearMock },
  { key: 'rain', label: '비 · 서울', data: rainMock },
  { key: 'storm', label: '폭풍 · 서울', data: stormMock },
  { key: 'foggy', label: '안개 · 서울', data: foggyMock },
  { key: 'polar-night', label: '극야 · 스발바르', data: polarNightMock },
  { key: 'polar-day', label: '백야 · 맥머도', data: mcmurdoPolarDayMock },
]
const activeKey = computed(() => mocks.find((m) => m.data === raw.value)?.key)

function pick(mock) {
  error.value = null
  loadMock(mock)
  reset()
}

// 실 API 조회용 좌표 (STEP 8). VITE_OWM_API_KEY가 없으면 에러 UI로 확인 가능.
const lat = ref(37.5665)
const lon = ref(126.978)

function fetchLive() {
  reset()
  load(lat.value, lon.value)
}

pick(clearMock)
loadTideMock(TIDE_MOCKS[selectedStation.value.obsCode])
</script>

<template>
  <div class="weather-view">
    <section class="scene-intro">
      <div><p class="eyebrow"><el-icon><Location /></el-icon> WEATHER SCENE</p><h1>하늘로 읽는<br><em>오늘의 날씨</em></h1><span>태양 궤적을 드래그해 시간대별 풍경을 살펴보세요.</span></div>
      <span class="intro-cloud" aria-hidden="true">☁</span>
    </section>

    <el-card class="scene-controls" shadow="never">
      <p class="control-label">미리보기 날씨</p>
      <el-radio-group class="mock-picker" :model-value="activeKey" aria-label="목 데이터 선택">
        <el-radio-button
        v-for="m in mocks"
        :key="m.key"
        :value="m.key"
        @click="pick(m.data)"
      >
        {{ m.label }}
        </el-radio-button>
      </el-radio-group>

      <el-divider />
      <form class="live-fetch" @submit.prevent="fetchLive">
      <label>
        위도
        <el-input-number v-model="lat" :step="0.01" controls-position="right" />
      </label>
      <label>
        경도
        <el-input-number v-model="lon" :step="0.01" controls-position="right" />
      </label>
      <el-button type="primary" native-type="submit" :loading="loading">
        {{ loading ? '불러오는 중…' : '실시간 날씨 조회' }}
      </el-button>
    </form>
    </el-card>

    <el-alert v-if="error" class="error-box" :title="error" type="error" show-icon :closable="false"><template #default><el-button size="small" type="danger" plain @click="fetchLive">다시 시도</el-button></template></el-alert>

    <div class="stage-wrap">
      <SceneStage :params="sceneWithSea" />
      <div v-if="loading" class="skeleton" aria-hidden="true" />
    </div>

    <SunArcScrubber
      :sunrise="current?.sunrise ?? null"
      :sunset="current?.sunset ?? null"
      :mode="time.mode"
      :target-ms="targetMs"
      :is-scrubbing="isScrubbing"
      @scrub="scrubTo"
      @reset="reset"
    />

    <el-card class="tide-panel" shadow="never">
    <div class="station-row">
      <span class="station-label">조석 관측소</span>
      <StationPicker :stations="stations" :selected="selectedStation" @select="selectStation" />
    </div>

    <p class="hint tide-hint">
      물때: {{ selectedStation.name }} 조석예보(고, 저조) 실측 스냅샷입니다. 공공데이터포털 API로 직접 검증한 값이며,
      "실시간 물때 조회"를 누르면 매번 새로 조회합니다.
    </p>

    <div class="tide-controls">
      <el-button type="primary" plain :loading="tideLoading" @click="fetchLiveTide">
        {{ tideLoading ? '조회 중…' : '실시간 물때 조회' }}
      </el-button>
      <el-checkbox v-model="showFlowBand">물흐름 강한 구간 표시</el-checkbox>
    </div>

    <el-alert v-if="tideError" class="error-box" :title="tideError" type="error" show-icon :closable="false"><template #default><el-button size="small" type="danger" plain @click="fetchLiveTide">다시 시도</el-button></template></el-alert>

    <div v-else-if="tideExtrema.length" class="stage-wrap">
      <TideTrack
        :extrema="tideExtrema"
        :range-start="tideRangeStart"
        :range-end="tideRangeEnd"
        :target-ms="targetMs"
        :bands="flowBands"
        @scrub="scrubTo"
      />
      <div v-if="tideLoading" class="skeleton" aria-hidden="true" />
    </div>

    <p v-else-if="!tideLoading" class="hint">물때 데이터가 없습니다.</p>

    <div v-if="tideExtrema.length" class="mode-panel">
      <p>오늘 조차 {{ Math.round(tidalRange) }}cm</p>
    </div>
    </el-card>
  </div>
</template>

<style scoped>
.weather-view {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.scene-intro { display: flex; align-items: center; justify-content: space-between; min-height: 205px; padding: 32px 42px; overflow: hidden; border-radius: 24px; color: #fff; background: linear-gradient(120deg, #183f70, #3589c5); }
.eyebrow { display: flex; align-items: center; gap: 6px; color: #bdddf5; font-size: .78rem; font-weight: 750; letter-spacing: .08em; }
.scene-intro h1 { margin: 9px 0; color: #fff; font-size: 2.45rem; font-weight: 800; line-height: 1.1; letter-spacing: -.065em; }
.scene-intro h1 em { color: #f6d46c; font-style: normal; }
.scene-intro span { color: #d6ecfb; font-size: .9rem; }
.intro-cloud { padding-right: 8%; color: rgba(255,255,255,.83); font-size: 6.5rem; filter: drop-shadow(0 9px 10px rgba(13,52,89,.2)); }
.scene-controls, .tide-panel { border: 1px solid var(--color-border); border-radius: 18px; }
.scene-controls :deep(.el-card__body), .tide-panel :deep(.el-card__body) { padding: 22px; }
.control-label { margin-bottom: 12px; color: var(--color-heading); font-size: .9rem; font-weight: 750; }

.hint {
  color: var(--color-text);
  opacity: 0.75;
  font-size: 0.9rem;
  margin: 0 0 0.5rem;
}

.tide-hint {
  margin-top: 1rem;
}

.station-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.station-label {
  font-size: 0.85rem;
  color: var(--color-text);
  opacity: 0.75;
}

.tide-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}

.mode-panel {
  margin-top: 1rem;
  padding: 10px 13px;
  border-radius: 9px;
  background: #edf6fd;
  font-size: 0.85rem;
  color: #236fae;
  font-weight: 700;
}

.mode-panel p {
  margin: 0.2rem 0;
}

.mock-picker {
  display: flex;
  flex-wrap: wrap;
}

.live-fetch {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 0.75rem;
  margin-bottom: 0;
  font-size: 0.85rem;
}

.live-fetch label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: var(--color-text);
}

.error-box {
  margin: 0;
}

.stage-wrap {
  position: relative;
}

.skeleton {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 37%, #e2e8f0 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}

@keyframes shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
  }
}

@media (max-width: 600px) {
  .scene-intro { min-height: 185px; padding: 28px; }
  .scene-intro h1 { font-size: 2rem; }
  .intro-cloud { display: none; }
  .station-row { align-items: flex-start; flex-direction: column; }
}
</style>
