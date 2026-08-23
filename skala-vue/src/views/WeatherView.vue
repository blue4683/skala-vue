<script setup>
import { computed, ref } from 'vue'
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
import incheonDayPrev from '@/mocks/tide/incheon-2026-08-22.json'
import incheonDayToday from '@/mocks/tide/incheon-2026-08-23.json'
import incheonDayNext from '@/mocks/tide/incheon-2026-08-24.json'
import busanDayPrev from '@/mocks/tide/busan-2026-08-22.json'
import busanDayToday from '@/mocks/tide/busan-2026-08-23.json'
import busanDayNext from '@/mocks/tide/busan-2026-08-24.json'

const { raw, loading, error, load, loadMock } = useWeather()
const { targetMs, isScrubbing, scrubTo, reset } = useScrubTime()

const current = computed(() => raw.value?.data?.[0] ?? null)

const time = useSunPath(current, targetMs)
const scene = useSceneParams(current, time)

const {
  extrema: tideExtrema,
  rangeStart: tideRangeStart,
  rangeEnd: tideRangeEnd,
  normalizedLevelAt,
  load: loadTide,
  loadMock: loadTideMock,
} = useTide()

// 씬에 해수면을 얹는다 — Stage 5의 SeaLayer가 여기서 살아난다
const sceneWithSea = computed(() => ({
  ...scene.value,
  seaLevel: tideExtrema.value.length ? normalizedLevelAt(targetMs.value) : null,
}))

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

// 조건 밴드 토글
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
  { key: 'rain', label: '비 · 수원', data: rainMock },
  { key: 'storm', label: '폭풍 · 부산', data: stormMock },
  { key: 'foggy', label: '안개 · 광주', data: foggyMock },
  { key: 'polar-night', label: '극야 · 스발바르', data: polarNightMock },
  { key: 'polar-day', label: '백야 · 맥머도', data: mcmurdoPolarDayMock },
]
const activeKey = computed(() => mocks.find((m) => m.data === raw.value)?.key)

function pick(mock) {
  error.value = null
  loadMock(mock)
  reset()
}

const lat = ref(37.5665)
const lon = ref(126.978)

function fetchLive() {
  reset()
  load(lat.value, lon.value)
}

pick(clearMock) // 초기 장면
loadTideMock(TIDE_MOCKS[selectedStation.value.obsCode])
</script>

<template>
  <div class="weather-view">
    <div class="starfield" aria-hidden="true" />
    <div class="nebula" aria-hidden="true" />

    <el-card class="scene-controls" shadow="never">
      <p class="control-label">미리보기 날씨</p>
      <el-radio-group class="mock-picker" :model-value="activeKey" aria-label="목 데이터 선택">
        <el-radio-button v-for="m in mocks" :key="m.key" :value="m.key" @click="pick(m.data)">
          {{ m.label }}
        </el-radio-button>
      </el-radio-group>

      <el-divider />
      <form class="live-fetch" @submit.prevent="fetchLive">
        <label>위도 <el-input-number v-model="lat" :step="0.01" controls-position="right" /></label>
        <label>경도 <el-input-number v-model="lon" :step="0.01" controls-position="right" /></label>
        <el-button type="primary" native-type="submit" :loading="loading">
          {{ loading ? '불러오는 중…' : '실시간 날씨 조회' }}
        </el-button>
      </form>
    </el-card>

    <el-alert
      v-if="error"
      class="error-box"
      :title="error"
      type="error"
      show-icon
      :closable="false"
    >
      <template #default
        ><el-button size="small" type="danger" plain @click="fetchLive"
          >다시 시도</el-button
        ></template
      >
    </el-alert>

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
        <el-switch v-model="showFlowBand" active-text="물흐름 강한 구간 표시" />
        <el-button size="small" @click="fetchLiveTide">실시간 조석 조회</el-button>
      </div>

      <TideTrack
        :extrema="tideExtrema"
        :range-start="tideRangeStart"
        :range-end="tideRangeEnd"
        :target-ms="targetMs"
        :bands="flowBands"
        @scrub="scrubTo"
      />
    </el-card>
  </div>
</template>

<style scoped>
.weather-view {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border-radius: 20px;
  color-scheme: dark;
}

.starfield {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-color: var(--sg-bg);
  background-image:
    radial-gradient(1.4px 1.4px at 20px 30px, var(--sg-star), transparent 100%),
    radial-gradient(1px 1px at 90px 80px, var(--sg-star), transparent 100%),
    radial-gradient(1.6px 1.6px at 150px 40px, var(--sg-star), transparent 100%),
    radial-gradient(1px 1px at 60px 120px, var(--sg-star), transparent 100%),
    radial-gradient(1.2px 1.2px at 180px 150px, var(--sg-star), transparent 100%),
    radial-gradient(1px 1px at 10px 170px, var(--sg-star), transparent 100%);
  background-size: 200px 200px;
  background-repeat: repeat;
}

.nebula {
  position: absolute;
  z-index: 0;
  top: -220px;
  right: -120px;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  filter: blur(70px);
  pointer-events: none;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.28), transparent 70%);
}

.weather-view > :deep(.el-card),
.weather-view > .stage-wrap {
  position: relative;
  z-index: 1;
}

.weather-view :deep(.el-card) {
  background: var(--sg-bg-elevated);
  border-color: var(--sg-border-dark);
  color: var(--sg-text-inverse-700);
}

.weather-view :deep(.el-card__body) {
  color: var(--sg-text-inverse-700);
}

.control-label,
.station-label {
  color: var(--sg-text-inverse-900);
  font-weight: 600;
}

.mock-picker,
.weather-view :deep(.station-picker) {
  --el-radio-button-checked-bg-color: var(--sg-brand);
  --el-radio-button-checked-border-color: var(--sg-brand);
  --el-radio-button-checked-text-color: #fff;
}

.weather-view :deep(.el-radio-button__inner) {
  background: var(--sg-bg-elevated-2);
  border-color: var(--sg-border-dark);
  color: var(--sg-text-inverse-700);
}

.weather-view :deep(.el-divider) {
  border-color: var(--sg-border-dark);
}

.live-fetch {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 12px;
  margin-top: 12px;
}

.live-fetch label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.85rem;
  color: var(--sg-text-inverse-700);
}

.error-box {
  position: relative;
  z-index: 1;
}

.stage-wrap {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--sg-border-dark);
}

.skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    100deg,
    var(--sg-bg-elevated) 30%,
    var(--sg-bg-elevated-2) 50%,
    var(--sg-bg-elevated) 70%
  );
  background-size: 200% 100%;
  animation: skeleton-sheen 1.4s ease-in-out infinite;
}

@keyframes skeleton-sheen {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

.station-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.weather-view :deep(.sun-arc-scrubber) {
  position: relative;
  z-index: 1;
  padding: 4px 4px 0;
}

.weather-view :deep(.sun-arc-scrubber .scrub-info span),
.weather-view :deep(.sun-arc-scrubber .polar-note) {
  color: var(--sg-text-inverse-700);
}

.weather-view :deep(.el-slider__runway) {
  background-color: var(--sg-bg-elevated-2);
}

.weather-view :deep(.el-slider__bar) {
  background-color: var(--sg-brand);
}

.weather-view :deep(.el-slider__button) {
  border-color: var(--sg-brand);
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
  }
}
</style>
