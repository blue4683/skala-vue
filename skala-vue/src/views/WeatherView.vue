<script setup>
import { computed, ref } from 'vue'
import { useWeather } from '@/composables/useWeather'
import { useScrubTime } from '@/composables/useScrubTime'
import { useSunPath } from '@/composables/useSunPath'
import { useSceneParams } from '@/composables/useSceneParams'
import SceneStage from '@/components/scene/SceneStage.vue'
import SunArcScrubber from '@/components/SunArcScrubber.vue'

import clearMock from '@/mocks/clear.json'
import rainMock from '@/mocks/rain.json'
import stormMock from '@/mocks/storm.json'
import foggyMock from '@/mocks/foggy.json'
import polarNightMock from '@/mocks/polar-night.json'
import mcmurdoPolarDayMock from '@/mocks/mcmurdo-polar-day.json'

const { raw, loading, error, load, loadMock } = useWeather()
const { targetMs, isScrubbing, scrubTo, reset } = useScrubTime()

const current = computed(() => raw.value?.data?.[0] ?? null)

const time = useSunPath(current, targetMs)
const scene = useSceneParams(current, time)

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
      <SceneStage :params="scene" />
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
  </div>
</template>

<style scoped>
</style>
