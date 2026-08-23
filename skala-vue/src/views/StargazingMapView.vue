<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStargazingSites } from '@/composables/useStargazingSites'
import { findBestWindow } from '@/utils/observationScore'
import StargazingMap from '@/components/stargazing/StargazingMap.vue'
import MapLayerToggle from '@/components/stargazing/MapLayerToggle.vue'
import ObservationTimeRibbon from '@/components/stargazing/ObservationTimeRibbon.vue'
import SiteDetailPanel from '@/components/stargazing/SiteDetailPanel.vue'

const {
  sites,
  loading,
  error,
  weatherUpdatedAt,
  weatherSource,
  weatherProvider,
  loadLiveData,
  evaluateAt,
  buildTonightSlots,
  scoresAt,
  scoresAtBestTimes,
  defaultBestTime,
} = useStargazingSites()

const activeLayer = ref('recommendation')
const comparisonDate = new Date()
const selectedSiteId = ref(sites.value[0]?.id ?? null)
const selectedSite = computed(() => sites.value.find((s) => s.id === selectedSiteId.value) ?? null)
const selectedTime = ref(defaultBestTime(selectedSite.value))
const timeSlots = computed(() => buildTonightSlots(selectedSite.value))

const siteScores = computed(() => scoresAtBestTimes(comparisonDate))

const layerBasis = computed(() => {
  if (activeLayer.value === 'lightPollution') return 'VIIRS 월간 야간광 기반 상대 지수'
  return '도시별 오늘 밤 기본 관측 시각 기준 · 상세 시간 선택과 별도'
})

const selectedEvaluation = computed(() =>
  selectedSite.value ? evaluateAt(selectedSite.value, selectedTime.value) : null,
)

const hourlyScores = computed(() => {
  if (!selectedSite.value || !timeSlots.value.length) return []
  return timeSlots.value.map((t) => ({
    time: t.getTime(),
    score: scoresAt(t).find((s) => s.id === selectedSite.value.id)?.score ?? null,
  }))
})

const selectedBestWindow = computed(() => {
  if (!hourlyScores.value.length) return null
  return findBestWindow(hourlyScores.value)
})

const weatherStatusLabel = computed(() => {
  if (!weatherUpdatedAt.value) return null
  const collectedAt = weatherUpdatedAt.value.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const providerLabel =
    weatherProvider.value === 'openweather' ? 'OpenWeather 대체 예보' : 'Open-Meteo 예보'

  if (weatherSource.value === 'stale-cache') {
    return `실시간 예보 조회 실패로 저장된 ${providerLabel}를 표시합니다 · ${collectedAt} 수집`
  }
  if (weatherSource.value === 'cache') {
    return `저장된 ${providerLabel} · ${collectedAt} 수집`
  }
  return `${providerLabel} · ${collectedAt} 수집`
})

function selectSite(id) {
  selectedSiteId.value = id
}

watch(selectedSiteId, () => {
  selectedTime.value = defaultBestTime(selectedSite.value)
})

onMounted(async () => {
  await loadLiveData()
  selectedTime.value = defaultBestTime(selectedSite.value)
})
</script>

<template>
  <!--
    THESIS: night-sky data reads as astronomy, not a dashboard — dark navy canvas, starfield,
    and warm nebula glow carry the map; a light frosted-glass panel is the one bright surface,
    reserved for the dense numbers a user actually reads.
    OWN-WORLD: --sg-bg/-elevated navy surfaces, starfield + nebula backdrop, --sg-brand (#2563eb)
    as the sole interactive accent, --sg-glass frosted card for data, status colors (teal/amber/
    slate) unchanged from the light-theme system, reused as glow rings on the dark map.
    STORY: visitor picks a candidate site and a tonight time slot; the map and glass panel
    answer "is it dark/clear/moonlit enough, and what will I actually see" with traceable
    per-factor bars, never a bare composite score.
    FIRST VIEWPORT: dark hero (title + one line), floating segmented layer toggle, map+detail
    two-column below, dark hour-strip at the bottom.
    FORM: pinned by user-supplied reference image (src/assets/image.png); no direction tournament run.
    FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review,
    the verdict, DESIGN.md, and every shipping raster carrying its provenance.
  -->
  <div class="stargazing-view">
    <div class="starfield" aria-hidden="true" />
    <div class="nebula nebula-a" aria-hidden="true" />
    <div class="nebula nebula-b" aria-hidden="true" />

    <section class="view-intro">
      <h1>오늘 밤,<br /><em>어디서 별을 볼까</em></h1>
      <p class="intro-copy">
        광공해·구름·달빛·시정을 규칙으로 판정해 후보지 점수와 관측 가능 별자리를 보여줍니다.
      </p>
    </section>

    <div class="layer-controls">
      <MapLayerToggle v-model="activeLayer" />
      <p class="layer-basis">{{ layerBasis }}</p>
    </div>

    <p class="live-status" role="status" aria-live="polite">
      <span v-if="loading">날씨 예보·VIIRS 실시간 데이터를 불러오는 중…</span>
      <template v-else>
        <span v-if="error" class="is-error">{{ error }}</span>
        <span
          v-if="weatherStatusLabel"
          :class="{
            'is-warning': weatherSource === 'stale-cache' || weatherProvider === 'openweather',
          }"
        >
          {{ weatherStatusLabel }}
        </span>
      </template>
    </p>

    <div class="map-layout">
      <StargazingMap
        class="map-pane"
        :sites="sites"
        :scores="siteScores"
        :active-layer="activeLayer"
        :selected-site-id="selectedSiteId"
        @select="selectSite"
      />
      <SiteDetailPanel
        v-if="selectedSite && selectedEvaluation?.factors"
        class="detail-pane"
        :site="selectedSite"
        :evaluation="selectedEvaluation"
        :best-window="selectedBestWindow"
        :requested-at="selectedTime"
      />
    </div>

    <section class="time-bar">
      <div class="time-bar-label">
        <p class="time-bar-title">오늘 밤 관측 창</p>
        <p class="time-bar-hint">시간을 누르면 선택한 도시의 상세 정보와 별자리가 갱신됩니다.</p>
      </div>
      <ObservationTimeRibbon
        v-if="timeSlots.length"
        v-model="selectedTime"
        :time-slots="timeSlots"
        :hourly-scores="hourlyScores"
        :timezone="selectedSite?.timezone"
      />
      <p v-else class="no-night-note">
        이 위치·날짜 기준으로는 오늘 밤 항해박명 구간을 계산할 수 없어요(예: 백야 지역).
      </p>
    </section>
  </div>
</template>

<style scoped>
.stargazing-view {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
  border-radius: 20px;
  color-scheme: dark;
}

/* z-index:0 (not negative): a negative z-index would paint behind this element's own
   background/border layer rather than in front of it, hiding the whole backdrop. */
.starfield {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-color: var(--sg-bg);
  background-image:
    radial-gradient(1.4px 1.4px at 20px 30px, var(--sg-star), transparent 100%),
    radial-gradient(1px 1px at 90px 80px, var(--sg-star), transparent 100%),
    radial-gradient(1.6px 1.6px at 150px 40px, var(--sg-star), transparent 100%),
    radial-gradient(1px 1px at 60px 120px, var(--sg-star), transparent 100%),
    radial-gradient(1.2px 1.2px at 180px 150px, var(--sg-star), transparent 100%),
    radial-gradient(1px 1px at 10px 170px, var(--sg-star), transparent 100%);
  background-size: 200px 200px;
  background-repeat: repeat;
}

.nebula {
  position: absolute;
  z-index: 0;
  width: 560px;
  height: 560px;
  border-radius: 50%;
  filter: blur(70px);
  pointer-events: none;
}

.nebula-a {
  top: -220px;
  left: -80px;
  background: radial-gradient(circle, rgba(217, 119, 6, 0.35), transparent 70%);
}

.nebula-b {
  bottom: -260px;
  right: -120px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.3), transparent 70%);
}

.view-intro {
  position: relative;
  z-index: 1;
}

.live-status {
  position: relative;
  z-index: 1;
  min-height: 20px;
  margin: -8px 0 0;
  color: var(--sg-text-inverse-500);
  font-size: 0.78rem;
}

.live-status span + span::before {
  content: ' · ';
}

.layer-controls {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

.layer-basis {
  margin: 0;
  color: var(--sg-text-inverse-500);
  font-size: 0.75rem;
}

.live-status .is-error {
  color: var(--sg-warning);
}

.live-status .is-warning {
  color: var(--sg-warning);
}

.view-intro h1 {
  margin: 0 0 10px;
  font-size: clamp(1.75rem, 1.1rem + 3vw, 2.75rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--sg-text-inverse-900);
}

.view-intro h1 em {
  font-style: normal;
  color: var(--sg-brand);
}

.intro-copy {
  margin: 0;
  max-width: 52ch;
  color: var(--sg-text-inverse-700);
}

.map-layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
  align-items: stretch;
  height: 620px;
  min-height: 0;
}

.map-pane {
  min-height: 0;
}

.detail-pane {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  scrollbar-color: var(--sg-ink-500) transparent;
  scrollbar-width: thin;
}

.time-bar {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  background: var(--sg-bg-elevated);
  border: 1px solid var(--sg-border-dark);
}

.time-bar-label {
  min-width: 160px;
}

.time-bar-title {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--sg-text-inverse-900);
}

.time-bar-hint {
  margin: 2px 0 0;
  font-size: 0.72rem;
  color: var(--sg-text-inverse-500);
}

.time-bar :deep(.time-ribbon) {
  flex: 1;
}

.no-night-note {
  margin: 0;
  color: var(--sg-text-inverse-700);
}

@media (max-width: 860px) {
  .map-layout {
    grid-template-columns: 1fr;
    height: auto;
  }

  .map-pane {
    height: 360px;
    min-height: 360px;
  }

  .detail-pane {
    height: 560px;
  }
}

@media (max-width: 640px) {
  .stargazing-view {
    padding: 16px;
  }
}
</style>
