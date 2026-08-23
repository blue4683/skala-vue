<script setup>
import { computed } from 'vue'

const props = defineProps({
  x: { type: Number, required: true }, // 0~1
  altitude: { type: Number, required: true }, // 0~1
  isNight: { type: Boolean, required: true },
})

// 정규화 좌표(0~1)를 SVG 좌표로 바꾸는 지점. 호(arc) 형태를 여기서 만든다.
const cx = computed(() => 100 + props.x * 800) // 좌우 여백 100
const cy = computed(() => 500 - props.altitude * 380) // 지평선 500, 천정 120

const radius = computed(() => (props.isNight ? 22 : 30))
const fill = computed(() => (props.isNight ? '#E8ECF4' : '#FFE6A0'))
const glow = computed(() => (props.isNight ? '#E8ECF4' : '#FFD873'))
</script>

<template>
  <circle :cx="cx" :cy="cy" :r="radius + 14" :fill="glow" opacity="0.25" />
  <circle :cx="cx" :cy="cy" :r="radius" :fill="fill" />
</template>
