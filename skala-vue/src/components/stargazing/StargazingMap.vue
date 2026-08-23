<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Map as MapLibreMap, Marker, NavigationControl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const props = defineProps({
  sites: { type: Array, required: true }, // [{id, name, latitude, longitude}]
  scores: { type: Array, required: true }, // sites와 같은 id, [{id, score, status}]
  activeLayer: { type: String, required: true }, // 'recommendation' | 'lightPollution' | 'cloud'
  selectedSiteId: { type: String, default: null },
})

const emit = defineEmits(['select'])

const mapEl = ref(null)
let map = null
const markers = new Map()

// 적록 대비를 피한 4단계 색상(Stage 7의 KoreaMap과 같은 팔레트)
const STATUS_COLOR = {
  recommended: '#0d9488',
  conditional: '#b45309',
  unavailable: '#94a3b8',
}

function scoreOf(siteId) {
  return props.scores.find((s) => s.id === siteId) ?? null
}

// 레이어별로 마커에 표시할 값과 색상을 다르게 매긴다. 광공해/구름은 §4.2의 래스터 레이어 대신
// 지금 있는 10개 포인트에 값을 인코딩해 보여주는 1단계 단순화다(라이선스 확보 전 대안).
function markerContent(site) {
  const s = scoreOf(site.id)
  if (props.activeLayer === 'lightPollution') {
    return { label: String(site.darknessScore ?? '–'), color: '#1d4ed8' }
  }
  if (props.activeLayer === 'cloud') {
    const cloud = s?.factors?.cloud?.totalPercent
    return { label: cloud != null ? `${cloud}%` : '–', color: '#475569' }
  }
  if (!s || s.score === null) return { label: '–', color: STATUS_COLOR.unavailable }
  return { label: String(s.score), color: STATUS_COLOR[s.status] ?? STATUS_COLOR.unavailable }
}

function buildMarkerEl(site) {
  const el = document.createElement('button')
  el.type = 'button'
  el.className = 'site-marker'
  el.setAttribute('aria-label', site.name)
  el.addEventListener('click', () => emit('select', site.id))
  return el
}

function renderMarkers() {
  if (!map) return
  for (const site of props.sites) {
    let marker = markers.get(site.id)
    if (!marker) {
      const el = buildMarkerEl(site)
      marker = new Marker({ element: el }).setLngLat([site.longitude, site.latitude]).addTo(map)
      markers.set(site.id, marker)
    }
    const el = marker.getElement()
    const { label, color } = markerContent(site)
    el.textContent = label
    el.style.setProperty('--marker-color', color)
    el.classList.toggle('is-selected', site.id === props.selectedSiteId)
  }
}

let resizeObserver = null

onMounted(() => {
  map = new MapLibreMap({
    container: mapEl.value,
    style: 'https://demotiles.maplibre.org/style.json',
    center: [127.8, 36.3],
    zoom: 6.2,
    attributionControl: true,
  })
  map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
  map.on('error', (e) => console.error('[StargazingMap] MapLibre error:', e?.error?.message ?? e))
  map.on('load', renderMarkers)

  // 그리드/플렉스 레이아웃 안에서는 컨테이너의 최종 크기가 지도 생성 시점 이후에
  // 확정되는 경우가 있다. 그러면 캔버스 내부 좌표계가 어긋나 지도가 빈 화면으로 보인다.
  resizeObserver = new ResizeObserver(() => map?.resize())
  resizeObserver.observe(mapEl.value)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  markers.clear()
  map?.remove()
  map = null
})

watch(() => [props.scores, props.activeLayer, props.selectedSiteId], renderMarkers, { deep: true })
</script>

<template>
  <div ref="mapEl" class="stargazing-map" role="img" aria-label="별 관측 후보지 지도" />
</template>

<style scoped>
.stargazing-map {
  width: 100%;
  height: 100%;
  min-height: 420px;
  border-radius: 16px;
  overflow: hidden;
}

:deep(.site-marker) {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid #fff;
  background: var(--marker-color, #0d9488);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
}

:deep(.site-marker.is-selected) {
  outline: 3px solid #facc15;
  outline-offset: 2px;
}
</style>
