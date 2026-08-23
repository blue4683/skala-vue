<script setup>
import { ref, computed } from 'vue'
import { Location } from '@element-plus/icons-vue'
import { useStargazingSites } from '@/composables/useStargazingSites'
import { useObservationScore } from '@/composables/useObservationScore'
import { findBestWindow } from '@/utils/observationScore'
import StargazingMap from '@/components/stargazing/StargazingMap.vue'
import MapLayerToggle from '@/components/stargazing/MapLayerToggle.vue'
import ObservationTimeRibbon from '@/components/stargazing/ObservationTimeRibbon.vue'
import SiteDetailPanel from '@/components/stargazing/SiteDetailPanel.vue'

const { sites, buildTonightSlots, scoresAt, defaultBestTime } = useStargazingSites()

const timeSlots = buildTonightSlots()
const activeLayer = ref('recommendation')
const selectedTime = ref(defaultBestTime())
const selectedSiteId = ref(sites.value[0]?.id ?? null)

const siteScores = computed(() => scoresAt(selectedTime.value))

const selectedSite = computed(() => sites.value.find((s) => s.id === selectedSiteId.value) ?? null)
const selectedEvaluation = useObservationScore(selectedSite, selectedTime)

const selectedBestWindow = computed(() => {
  if (!selectedSite.value || !timeSlots.length) return null
  const hourly = timeSlots.map((t) => ({
    time: t.getTime(),
    score: scoresAt(t).find((s) => s.id === selectedSite.value.id)?.score ?? null,
  }))
  return findBestWindow(hourly)
})

function selectSite(id) {
  selectedSiteId.value = id
}
</script>

<template>
  <div class="stargazing-view">
    <section class="view-intro">
      <p class="eyebrow">
        <el-icon><Location /></el-icon> STARGAZING MAP
      </p>
      <h1>오늘 밤,<br /><em>어디서 별을 볼까</em></h1>
      <p class="intro-copy">
        광공해·구름·달빛·시정을 규칙으로 판정해 후보지 점수와 관측 가능 별자리를 보여줍니다.
      </p>
    </section>

    <MapLayerToggle v-model="activeLayer" />

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
        v-if="selectedSite && selectedEvaluation"
        class="detail-pane"
        :site="selectedSite"
        :evaluation="selectedEvaluation"
        :best-window="selectedBestWindow"
        :requested-at="selectedTime"
      />
    </div>

    <ObservationTimeRibbon v-if="timeSlots.length" v-model="selectedTime" :time-slots="timeSlots" />
    <p v-else class="no-night-note">
      이 위치·날짜 기준으로는 오늘 밤 항해박명 구간을 계산할 수 없어요(예: 백야 지역).
    </p>
  </div>
</template>

<style scoped>
.stargazing-view {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 6px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #5590bd;
}

.view-intro h1 {
  margin: 0 0 6px;
}

.intro-copy {
  margin: 0;
  color: #55738d;
}

.map-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
  align-items: start;
}

.map-pane {
  height: 520px;
}

@media (max-width: 860px) {
  .map-layout {
    grid-template-columns: 1fr;
  }
}
</style>
