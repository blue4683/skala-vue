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

    <el-alert v-if="error" class="error-box" :title="error" type="error" show-icon :closable="false">
      <template #default><el-button size="small" type="danger" plain @click="fetchLive">다시 시도</el-button></template>
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
</style>
