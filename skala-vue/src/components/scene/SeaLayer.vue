<script setup>
import { computed } from 'vue'

const props = defineProps({
  level: { type: Number, required: true }, // 0~1, 조위 정규화값
})

// CelestialBody.vue와 동일한 지평선(500)/바닥(600) 기준을 공유한다.
const HORIZON_Y = 500
const BOTTOM_Y = 600

const seaY = computed(() => BOTTOM_Y - props.level * (BOTTOM_Y - HORIZON_Y))
</script>

<template>
  <line x1="0" :y1="HORIZON_Y" x2="1000" :y2="HORIZON_Y" class="horizon" />
  <rect x="0" :y="seaY" width="1000" :height="BOTTOM_Y - seaY" class="sea" />
</template>

<style scoped>
.horizon { stroke: rgba(255, 255, 255, 0.35); stroke-width: 1; }
.sea { fill: #1b4965; opacity: 0.55; }
</style>
