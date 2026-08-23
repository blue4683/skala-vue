<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import {
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  setWorkerUrl,
} from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import 'maplibre-gl/dist/maplibre-gl.css'

setWorkerUrl(maplibreWorkerUrl)

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
const halos = new Map()

// 적록 대비를 피한 4단계 색상(Stage 7의 KoreaMap과 같은 팔레트), 흰 글자 대비 4.5:1 이상 확보
const STATUS_COLOR = {
  recommended: { fill: '#0f766e', glow: 'rgba(45, 212, 191, 0.65)' },
  conditional: { fill: '#b45309', glow: 'rgba(251, 146, 60, 0.6)' },
  unavailable: { fill: '#475569', glow: 'rgba(148, 163, 184, 0.5)' },
}
const DATA_COLOR = { fill: '#7c3aed', glow: 'rgba(167, 139, 250, 0.6)' }
const CLOUD_COLOR = { fill: '#475569', glow: 'rgba(148, 163, 184, 0.5)' }

function scoreOf(siteId) {
  return props.scores.find((s) => s.id === siteId) ?? null
}

// 레이어별로 마커에 표시할 값과 색상을 다르게 매긴다. 광공해/구름은 §4.2의 래스터 레이어 대신
// 지금 있는 10개 포인트에 값을 인코딩해 보여주는 1단계 단순화다(라이선스 확보 전 대안).
function markerContent(site) {
  const s = scoreOf(site.id)
  if (props.activeLayer === 'lightPollution') {
    return { label: String(site.darknessScore ?? '–'), ...DATA_COLOR }
  }
  if (props.activeLayer === 'cloud') {
    const cloud = s?.factors?.cloud?.totalPercent
    return { label: cloud != null ? `${cloud}%` : '–', ...CLOUD_COLOR }
  }
  if (!s || s.score === null) return { label: '–', ...STATUS_COLOR.unavailable }
  return { label: String(s.score), ...(STATUS_COLOR[s.status] ?? STATUS_COLOR.unavailable) }
}

function buildMarkerEl(site) {
  const el = document.createElement('button')
  el.type = 'button'
  el.className = 'site-marker'
  el.setAttribute('aria-label', site.name)
  el.addEventListener('click', () => emit('select', site.id))
  return el
}

function buildHaloEl() {
  const el = document.createElement('div')
  el.className = 'site-halo'
  el.setAttribute('aria-hidden', 'true')
  return el
}

// 0~100 지표를 관측 적합도 "영역" 글로우의 크기·강도로 변환한다. 실측 경계가 아니라
// 후보지 주변의 대략적인 영향권을 은유하는 장치이므로 범위를 넓게 잡지 않는다
// (§9 "관측 추천은 안전 보증이 아니다" 원칙과 같은 이유로, 정밀도를 과장하지 않는다).
function haloIntensity(value) {
  const v = value == null ? 0 : Math.max(0, Math.min(100, value))
  return {
    size: 160 + (v / 100) * 110, // 160px~270px
    opacity: 0.22 + (v / 100) * 0.3, // 0.22~0.52
  }
}

function haloValue(site, layer, s) {
  if (layer === 'lightPollution') return site.darknessScore ?? 0
  if (layer === 'cloud') {
    const cloud = s?.factors?.cloud?.totalPercent
    return cloud == null ? 0 : 100 - cloud // 구름이 적을수록(맑을수록) 영역을 크게
  }
  return s?.score ?? 0
}

function renderMarkers() {
  if (!map) return
  for (const site of props.sites) {
    const s = scoreOf(site.id)
    const { label, fill, glow } = markerContent(site)

    let halo = halos.get(site.id)
    if (!halo) {
      halo = new Marker({ element: buildHaloEl() })
        .setLngLat([site.longitude, site.latitude])
        .addTo(map)
      halos.set(site.id, halo)
    }
    const haloEl = halo.getElement()
    const { size, opacity } = haloIntensity(haloValue(site, props.activeLayer, s))
    haloEl.style.setProperty('--halo-color', glow)
    haloEl.style.width = `${size}px`
    haloEl.style.height = `${size}px`
    haloEl.style.opacity = opacity

    let marker = markers.get(site.id)
    if (!marker) {
      const el = buildMarkerEl(site)
      marker = new Marker({ element: el }).setLngLat([site.longitude, site.latitude]).addTo(map)
      markers.set(site.id, marker)
    }
    const el = marker.getElement()
    el.textContent = label
    el.style.setProperty('--marker-color', fill)
    el.style.setProperty('--marker-glow', glow)
    el.classList.toggle('is-selected', site.id === props.selectedSiteId)
  }
}

let resizeObserver = null

onMounted(() => {
  map = new MapLibreMap({
    container: mapEl.value,
    style: 'https://demotiles.maplibre.org/style.json',
    center: [15, 20],
    zoom: 1.2,
    attributionControl: true,
  })
  map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
  map.on('error', (e) => console.error('[StargazingMap] MapLibre error:', e?.error?.message ?? e))
  map.on('load', () => {
    renderMarkers()
    if (props.sites.length > 1) {
      const bounds = new LngLatBounds()
      props.sites.forEach((site) => bounds.extend([site.longitude, site.latitude]))
      map.fitBounds(bounds, { padding: 36, maxZoom: 3, duration: 0 })
    }
  })

  // 그리드/플렉스 레이아웃 안에서는 컨테이너의 최종 크기가 지도 생성 시점 이후에
  // 확정되는 경우가 있다. 그러면 캔버스 내부 좌표계가 어긋나 지도가 빈 화면으로 보인다.
  resizeObserver = new ResizeObserver(() => map?.resize())
  resizeObserver.observe(mapEl.value)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  markers.clear()
  halos.clear()
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
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--sg-border-dark);
  background: var(--sg-bg-elevated);
}

/* demotiles has no dark style. A plain brightness/contrast cut just compresses everything
   into flat gray (the "too bright, not clear" complaint) because it darkens the near-white
   base and the label text by the same amount. Inverting first flips the near-white base to
   near-black and dark labels/borders to light ones, THEN hue-rotate brings the flipped hues
   back toward their original family — a genuinely dark map with labels that still read. */
.stargazing-map :deep(.maplibregl-canvas) {
  filter: invert(1) hue-rotate(185deg) brightness(0.75) contrast(1.15) saturate(0.65);
}

:deep(.site-halo) {
  border-radius: 50%;
  background: radial-gradient(
    circle,
    var(--halo-color, rgba(45, 212, 191, 0.5)) 0%,
    transparent 72%
  );
  filter: blur(6px);
  pointer-events: none;
  z-index: 0;
}

:deep(.site-marker) {
  z-index: 1;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.85);
  background: var(--marker-color, #0f766e);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow:
    0 0 0 6px var(--marker-glow, rgba(45, 212, 191, 0.5)),
    0 3px 10px rgba(0, 0, 0, 0.5);
}

:deep(.site-marker:focus-visible) {
  outline: 3px solid var(--sg-brand);
  outline-offset: 3px;
}

:deep(.site-marker.is-selected) {
  outline: 3px solid #facc15;
  outline-offset: 3px;
}
</style>
