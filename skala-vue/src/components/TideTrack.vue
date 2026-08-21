<script setup>
import { ref, computed } from 'vue'
import { buildTideSeries, tideExtent } from '@/utils/tideCurve'

const props = defineProps({
  extrema: { type: Array, required: true }, // TideExtremum[]
  rangeStart: { type: Number, required: true }, // epoch ms
  rangeEnd: { type: Number, required: true }, // epoch ms
  targetMs: { type: Number, required: true },
  bands: { type: Array, default: () => [] }, // {from, to}[], 강조 구간(예: 물흐름 강한 구간)
})

const emit = defineEmits(['scrub'])

const trackEl = ref(null)
let dragging = false

const CHART_W = 1000
const CHART_H = 200
const PAD_Y = 20

const extent = computed(() => tideExtent(props.extrema))
const series = computed(() => buildTideSeries(props.extrema, props.rangeStart, props.rangeEnd))

function xAt(t) {
  return ((t - props.rangeStart) / (props.rangeEnd - props.rangeStart)) * CHART_W
}
function yAt(level) {
  const { min, max } = extent.value
  const span = max - min || 1
  const norm = (level - min) / span
  return CHART_H - PAD_Y - norm * (CHART_H - PAD_Y * 2)
}

const pathD = computed(() =>
  series.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${xAt(p.t).toFixed(1)},${yAt(p.level).toFixed(1)}`).join(' '),
)

const areaD = computed(() => {
  if (!series.value.length) return ''
  const baseline = CHART_H - PAD_Y
  return `${pathD.value} L ${xAt(series.value.at(-1).t).toFixed(1)},${baseline} L ${xAt(series.value[0].t).toFixed(1)},${baseline} Z`
})

const markers = computed(() =>
  props.extrema
    .filter((p) => p.time >= props.rangeStart && p.time <= props.rangeEnd)
    .map((p) => ({
      ...p,
      x: xAt(p.time),
      y: yAt(p.level),
      timeLabel: new Date(p.time).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' }),
    })),
)

// 10분 간격 샘플에서 targetMs에 가장 가까운 점을 커서 값으로 쓴다 (근사 충분)
const cursorLevel = computed(() => {
  const points = series.value
  if (!points.length) return null
  let closest = points[0]
  let bestDiff = Math.abs(points[0].t - props.targetMs)
  for (const point of points) {
    const diff = Math.abs(point.t - props.targetMs)
    if (diff < bestDiff) {
      bestDiff = diff
      closest = point
    }
  }
  return closest.level
})
const cursorX = computed(() => xAt(props.targetMs))
const cursorY = computed(() => (cursorLevel.value === null ? null : yAt(cursorLevel.value)))

const cursorTimeLabel = computed(() =>
  new Date(props.targetMs).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' }),
)

function updateFromX(clientX) {
  if (!trackEl.value) return
  const rect = trackEl.value.getBoundingClientRect()
  const p = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  emit('scrub', props.rangeStart + p * (props.rangeEnd - props.rangeStart))
}

function onPointerDown(e) {
  e.target.setPointerCapture(e.pointerId)
  dragging = true
  updateFromX(e.clientX)
}
function onPointerMove(e) {
  if (dragging) updateFromX(e.clientX)
}
function onPointerUp(e) {
  if (!dragging) return
  e.target.releasePointerCapture(e.pointerId)
  dragging = false
}

function step(minutes) {
  const next = props.targetMs + minutes * 60_000
  emit('scrub', Math.min(props.rangeEnd, Math.max(props.rangeStart, next)))
}
</script>

<template>
  <div class="tide-track">
    <div class="chart-header">
      <div><p class="eyebrow">TIDE LEVEL</p><p class="caption">조위 <b>{{ cursorLevel !== null ? `${Math.round(cursorLevel)}cm` : '—' }}</b></p></div>
      <span class="hint">{{ cursorTimeLabel }} 기준</span>
    </div>

    <svg
      ref="trackEl"
      class="chart"
      role="slider"
      tabindex="0"
      :viewBox="`0 0 ${CHART_W} ${CHART_H}`"
      preserveAspectRatio="none"
      :aria-valuemin="rangeStart"
      :aria-valuemax="rangeEnd"
      :aria-valuenow="Math.round(targetMs)"
      :aria-valuetext="cursorLevel !== null ? `${cursorTimeLabel} 조위 ${Math.round(cursorLevel)}cm` : ''"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @keydown.left.prevent="step(-15)"
      @keydown.right.prevent="step(15)"
    >
      <defs>
        <linearGradient id="tideArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#4daddd" stop-opacity=".35" />
          <stop offset="100%" stop-color="#4daddd" stop-opacity=".03" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" :width="CHART_W" :height="CHART_H" rx="12" class="chart-bg" />
      <line v-for="y in [40, 100, 160]" :key="y" x1="0" :y1="y" :x2="CHART_W" :y2="y" class="guide-line" />
      <rect
        v-for="b in bands"
        :key="b.from"
        :x="xAt(b.from)"
        y="0"
        :width="Math.max(0, xAt(b.to) - xAt(b.from))"
        :height="CHART_H"
        class="band"
      />
      <path :d="areaD" class="area" />
      <path :d="pathD" class="curve" fill="none" />
      <circle v-for="m in markers" :key="m.time" :cx="m.x" :cy="m.y" r="5" :class="['marker', m.type]" />
      <line v-if="cursorY !== null" :x1="cursorX" :x2="cursorX" y1="0" :y2="CHART_H" class="cursor-line" />
      <circle v-if="cursorY !== null" :cx="cursorX" :cy="cursorY" r="5" class="cursor-dot" />
    </svg>

    <ul class="marker-list">
      <li v-for="m in markers" :key="m.time" :class="m.type">
        {{ m.type === 'high' ? '고조' : '저조' }} {{ m.timeLabel }} · {{ Math.round(m.level) }}cm
      </li>
    </ul>
  </div>
</template>

<style scoped>
.tide-track {
  margin-top: 16px;
  padding: 18px 18px 14px;
  border: 1px solid #d7e8f3;
  border-radius: 16px;
  background: #fbfdff;
}

.chart-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 10px; }
.eyebrow { margin-bottom: 3px; color: #5a94bf; font-size: .68rem; font-weight: 800; letter-spacing: .1em; }
.caption {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  margin: 0;
  color: #63809a;
  font-size: .82rem;
}
.caption b { margin-left: 2px; color: #193f62; font-size: 1.12rem; font-weight: 800; letter-spacing: -.04em; }

.hint {
  color: #7892a9;
  font-size: .75rem;
}

.chart {
  width: 100%;
  height: 135px;
  display: block;
  cursor: pointer;
  touch-action: none;
}

.chart:focus-visible {
  outline: 2px solid #2575c4;
  outline-offset: 2px;
}

.chart-bg { fill: #f2f9fd; }
.guide-line { stroke: #dcecf6; stroke-width: 1; vector-effect: non-scaling-stroke; }
.area { fill: url(#tideArea); }

.curve {
  stroke: #277ab6;
  stroke-width: 3;
  vector-effect: non-scaling-stroke;
}

.band {
  fill: #f3bc4b;
  opacity: 0.2;
}

.marker {
  fill: #fff;
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
}
.marker.high {
  stroke: #2276b3;
}
.marker.low {
  stroke: #6895b4;
}

.cursor-line {
  stroke: #e2a72a;
  stroke-width: 1;
  stroke-dasharray: 4 3;
  vector-effect: non-scaling-stroke;
}
.cursor-dot {
  fill: #e2a72a;
  stroke: #fff;
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
}

.marker-list {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 13px 0 0;
  padding: 0;
  color: #5d7b96;
  font-size: .75rem;
}

.marker-list li { padding: 5px 8px; border-radius: 999px; background: #eef6fb; }
.marker-list li.high { color: #236fa9; background: #e5f3fc; }
.marker-list li.low { color: #5b7f9e; }

@media (max-width: 540px) {
  .tide-track { padding: 15px 12px 12px; }
}
</style>
