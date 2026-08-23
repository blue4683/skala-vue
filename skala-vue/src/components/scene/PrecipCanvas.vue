<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { TUNING } from '@/constants/sceneTuning'

const props = defineProps({
  rainRate: { type: Number, required: true }, // 0~1
  snowRate: { type: Number, required: true }, // 0~1
  driftX: { type: Number, required: true }, // -1~1
  gustAmplitude: { type: Number, required: true }, // 0~1
})

const canvas = ref(null)

// 파티클 좌표는 매 프레임 바뀐다. ref에 넣으면 매 프레임 반응성 트리거가 돌아
// 프레임이 무너지므로 의도적으로 non-reactive plain 배열에 둔다.
let particles = []
let size = { w: 0, h: 0 }
let ctx = null
let raf = 0
let reduceMotion = false

function spawnRain(count) {
  return Array.from({ length: count }, () => ({
    kind: 'rain',
    x: Math.random() * size.w,
    y: Math.random() * size.h,
    len: 10 + Math.random() * 10,
    speed: 9 + Math.random() * 7,
  }))
}

function spawnSnow(count) {
  return Array.from({ length: count }, () => ({
    kind: 'snow',
    x: Math.random() * size.w,
    y: Math.random() * size.h,
    r: 1.5 + Math.random() * 2,
    speed: 1 + Math.random() * 1.5,
    wobble: Math.random() * Math.PI * 2,
  }))
}

function respawn() {
  const rainCount = Math.round(props.rainRate * TUNING.PARTICLE_MAX)
  const snowCount = Math.round(props.snowRate * TUNING.PARTICLE_MAX)
  const total = rainCount + snowCount
  const scale = total > TUNING.PARTICLE_MAX ? TUNING.PARTICLE_MAX / total : 1
  particles = [
    ...spawnRain(Math.round(rainCount * scale)),
    ...spawnSnow(Math.round(snowCount * scale)),
  ]
}

function resize() {
  const el = canvas.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  size = { w: rect.width, h: rect.height }

  // 고해상도 디스플레이 대응: CSS 크기와 실제 픽셀 크기를 분리한다
  const dpr = window.devicePixelRatio || 1
  el.width = rect.width * dpr
  el.height = rect.height * dpr
  ctx = el.getContext('2d')
  ctx.scale(dpr, dpr)

  respawn()
}

function step() {
  if (!ctx) return
  ctx.clearRect(0, 0, size.w, size.h)

  const windPush = props.driftX * 1.4
  const gustJitter = props.gustAmplitude * 1.2

  ctx.strokeStyle = 'rgba(190, 210, 255, 0.55)'
  ctx.lineWidth = 1.2
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'

  for (const p of particles) {
    if (p.kind === 'rain') {
      const dx = windPush + gustJitter * Math.sin(p.y * 0.05)
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x + dx, p.y + p.len)
      ctx.stroke()
      p.y += p.speed
      p.x += dx * 0.3
    } else {
      p.wobble += 0.03
      const dx = windPush * 0.6 + Math.sin(p.wobble) * (1 + gustJitter)
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fill()
      p.y += p.speed
      p.x += dx
    }

    // 화면 밖으로 나가면 반대편에서 다시 등장 (재사용, 새로 만들지 않음)
    if (p.y > size.h) {
      p.y = -10
      p.x = Math.random() * size.w
    }
    if (p.x > size.w) p.x = 0
    if (p.x < 0) p.x = size.w
  }
}

function loop() {
  step()
  raf = requestAnimationFrame(loop)
}

function onVisibilityChange() {
  if (document.hidden) {
    cancelAnimationFrame(raf)
  } else if (!reduceMotion) {
    raf = requestAnimationFrame(loop)
  }
}

watch(() => [props.rainRate, props.snowRate], respawn)

onMounted(() => {
  reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  resize()
  window.addEventListener('resize', resize)
  document.addEventListener('visibilitychange', onVisibilityChange)

  if (reduceMotion) {
    step() // 한 프레임만 그리고 멈춘다
    return
  }
  loop()
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<template>
  <canvas ref="canvas" class="precip-canvas" />
</template>

<style scoped>
.precip-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
