<script setup>
import { ref, computed, onMounted } from 'vue'
import { geoMercator, geoPath } from 'd3-geo'

const props = defineProps({
  segments: { type: Array, required: true }, // [{id, name, midpoint: [lat, lon]}]
  states: { type: Array, required: true }, // segments와 같은 길이, [{level, reason}]
})

const emit = defineEmits(['hover'])

const WIDTH = 460
const HEIGHT = 620

const geojson = ref(null)
const loadError = ref(null)

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}map/korea-coast.json`)
    if (!res.ok) throw new Error(`지도를 불러오지 못했습니다 (${res.status})`)
    geojson.value = await res.json()
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : '알 수 없는 오류'
  }
})

// 위경도 → 화면 좌표 투영. fitSize가 GeoJSON 전체를 주어진 크기에 맞춰준다.
const projection = computed(() =>
  geojson.value ? geoMercator().fitSize([WIDTH, HEIGHT], geojson.value) : null,
)
const pathGen = computed(() => (projection.value ? geoPath(projection.value) : null))

const provincePaths = computed(() => {
  if (!geojson.value || !pathGen.value) return []
  return geojson.value.features.map((f) => pathGen.value(f))
})

// 적록 대비를 피한 4단계 색상 — 어두운 지도 위에서 도드라지도록 채도를 높임
const STATE_COLOR = {
  open: '#2dd4bf', // 청록
  caution: '#f59e0b', // 황토
  blocked: '#e879f9', // 자주
  nodata: '#94a3b8', // 회색
}

const points = computed(() => {
  if (!projection.value) return []
  return props.segments.map((seg, i) => {
    const [lat, lon] = seg.midpoint
    const xy = projection.value([lon, lat]) // ⚠️ d3는 [경도, 위도] 순서!
    const state = props.states[i]
    return {
      id: seg.id,
      name: seg.name,
      x: xy?.[0] ?? 0,
      y: xy?.[1] ?? 0,
      level: state?.level ?? 'nodata',
      reason: state?.reason ?? [],
    }
  })
})
</script>

<template>
  <div class="korea-map">
    <p v-if="loadError" class="hint">{{ loadError }}</p>

    <svg
      v-else
      :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
      class="map-svg"
      role="img"
      aria-label="한반도 해안 활동 가능 영역 지도"
    >
      <path v-for="(d, i) in provincePaths" :key="i" :d="d" class="province" />

      <g
        v-for="p in points"
        :key="p.id"
        class="segment"
        :class="`is-${p.level}`"
        @mouseenter="emit('hover', p)"
        @mouseleave="emit('hover', null)"
      >
        <circle :cx="p.x" :cy="p.y" r="7" :fill="STATE_COLOR[p.level]" stroke="rgba(255, 255, 255, 0.85)" />
        <title>
          {{ p.name }} — {{ p.level }}{{ p.reason.length ? `(${p.reason.join(', ')})` : '' }}
        </title>
      </g>
    </svg>

    <ul class="legend" aria-label="범례">
      <li><i :style="{ background: STATE_COLOR.open }" />활동 가능</li>
      <li><i :style="{ background: STATE_COLOR.caution }" />일부 조건 미충족</li>
      <li><i class="nodata" /> 데이터 없음</li>
    </ul>
  </div>
</template>

<style scoped>
.korea-map {
  padding: 16px;
}
.province {
  fill: var(--sg-bg-elevated-2);
  stroke: var(--sg-border-dark);
  stroke-width: 1;
}
.segment circle {
  stroke-width: 2;
  cursor: pointer;
  filter: drop-shadow(0 0 6px currentColor);
}
.segment.is-open circle {
  color: rgba(45, 212, 191, 0.7);
}
.segment.is-caution circle {
  color: rgba(245, 158, 11, 0.65);
}
.segment.is-blocked circle {
  color: rgba(232, 121, 249, 0.65);
}
/* nodata는 색뿐 아니라 점선 테두리로도 구분한다 */
.segment.is-nodata circle {
  fill: var(--sg-bg-elevated-2);
  stroke: rgba(148, 163, 184, 0.7);
  stroke-dasharray: 3 2;
  filter: none;
}
.legend {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 12px 16px;
  margin: 0;
  color: var(--sg-text-inverse-700);
  font-size: 0.85rem;
}
.legend i {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 4px;
}
.legend i.nodata {
  background: var(--sg-bg-elevated-2);
  border: 1px dashed #94a3b8;
}
.hint {
  padding: 16px;
  color: var(--sg-text-inverse-700);
}
</style>
