<script setup>
import { computed } from 'vue'
import SkyGradient from './SkyGradient.vue'
import CelestialBody from './CelestialBody.vue'
import CloudLayer from './CloudLayer.vue'
import SeaLayer from './SeaLayer.vue'
import HazeOverlay from './HazeOverlay.vue'
import PrecipCanvas from './PrecipCanvas.vue'

const props = defineProps({
  params: { type: Object, required: true }, // SceneParams
})

// visibility가 낮을수록(blurPx 큼) 하늘 전체를 흐리게. backdrop-filter는 SVG
// 내부 도형에 안정적으로 적용되지 않아, svg 루트에 filter: blur()를 건다.
const skyFilter = computed(() => (props.params.blurPx > 0 ? `blur(${props.params.blurPx}px)` : 'none'))

// 색만으로 정보를 전달하지 않도록 장면 전체를 한 문장으로 대체 텍스트화한다.
const sceneDescription = computed(() => {
  const p = props.params
  const sky = p.cloudDensity < 0.2 ? '맑은' : p.cloudDensity < 0.5 ? '구름 조금 있는' : p.cloudDensity < 0.8 ? '구름 많은' : '흐린'

  let wind = '바람 거의 없음'
  if (p.driftSpeed >= 0.15) {
    const from = p.driftX > 0.05 ? '서쪽에서' : p.driftX < -0.05 ? '동쪽에서' : ''
    const strength = p.driftSpeed < 0.5 ? '약한' : '강한'
    wind = from ? `${from} ${strength} 바람` : `${strength} 바람`
  }

  const hasRain = p.rainRate >= 0.05
  const hasSnow = p.snowRate >= 0.05
  const precip = hasRain && hasSnow ? '비와 눈 내림' : hasRain ? '비 내림' : hasSnow ? '눈 내림' : '강수 없음'

  const timeOfDay = p.isNight ? '밤' : '낮'
  return `${sky} ${timeOfDay} 하늘, ${wind}, ${precip}`
})
</script>

<template>
  <div class="stage" role="img" :aria-label="sceneDescription">
    <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" :style="{ filter: skyFilter }">
      <SkyGradient :stops="params.skyStops" />
      <CelestialBody :x="params.bodyX" :altitude="params.altitude" :is-night="params.isNight" />
      <CloudLayer
        :cloud-density="params.cloudDensity"
        :drift-x="params.driftX"
        :drift-speed="params.driftSpeed"
        :gust-amplitude="params.gustAmplitude"
      />
      <SeaLayer v-if="params.seaLevel != null" :level="params.seaLevel" />
      <HazeOverlay :opacity="params.hazeOpacity" />
    </svg>
    <PrecipCanvas
      :rain-rate="params.rainRate"
      :snow-rate="params.snowRate"
      :drift-x="params.driftX"
      :gust-amplitude="params.gustAmplitude"
    />
  </div>
</template>

<style scoped>
.stage {
  position: relative;
  width: 100%;
  aspect-ratio: 5 / 3;
  overflow: hidden;
  border-radius: 12px;
}
svg {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
