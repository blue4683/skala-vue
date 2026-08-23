<script setup>
import { computed } from 'vue'

const props = defineProps({
  cloudDensity: { type: Number, required: true }, // 0~1
  driftX: { type: Number, required: true }, // -1~1 (+면 동쪽=오른쪽)
  driftSpeed: { type: Number, required: true }, // 0~1
  gustAmplitude: { type: Number, required: true }, // 0~1
})

// 뭉게구름 덩어리 좌표. 레이어 폭 1000(=viewBox 폭) 기준으로 좌표를 잡아야
// x=0, x=1000 두 벌을 이어붙였을 때 이음매 없이 반복된다.
const PUFFS = [
  { x: 60, r: 40 },
  { x: 110, r: 55 },
  { x: 175, r: 38 },
  { x: 420, r: 48 },
  { x: 470, r: 60 },
  { x: 530, r: 36 },
  { x: 760, r: 42 },
  { x: 815, r: 52 },
]
const OFFSETS = [0, 1000]

// 레이어마다 속도를 다르게 해 시차(parallax)를 만든다
const layers = computed(() =>
  Array.from({ length: 3 + Math.round(props.cloudDensity * 3) }, (_, i) => ({
    id: i,
    opacity: 0.25 + props.cloudDensity * 0.5,
    duration: 60 / (0.3 + props.driftSpeed * (1 + i * 0.3)), // 초
    direction: props.driftX >= 0 ? 'normal' : 'reverse',
    y: 80 + i * 60,
    scale: 0.7 + i * 0.12,
  })),
)

function driftStyle(layer) {
  return {
    animationDuration: `${layer.duration}s`,
    animationDirection: layer.direction,
    opacity: layer.opacity,
  }
}

function gustStyle() {
  return { '--amp': props.gustAmplitude }
}
</script>

<template>
  <g v-for="layer in layers" :key="layer.id" class="cloud-track" :style="driftStyle(layer)">
    <g
      v-for="offset in OFFSETS"
      :key="offset"
      :transform="`translate(${offset}, ${layer.y}) scale(${layer.scale})`"
    >
      <g class="cloud-gust" :style="gustStyle()">
        <ellipse
          v-for="(p, pi) in PUFFS"
          :key="pi"
          :cx="p.x"
          cy="0"
          :rx="p.r"
          :ry="p.r * 0.62"
          fill="#fff"
        />
      </g>
    </g>
  </g>
</template>

<style scoped>
.cloud-track {
  animation-name: cloud-drift;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}

.cloud-gust {
  animation: gust 2.6s ease-in-out infinite;
}

@keyframes cloud-drift {
  from {
    transform: translateX(-1000px);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes gust {
  50% {
    transform: translateY(calc(var(--amp) * 6px));
  }
}

@media (prefers-reduced-motion: reduce) {
  .cloud-track,
  .cloud-gust {
    animation: none;
  }
}
</style>
