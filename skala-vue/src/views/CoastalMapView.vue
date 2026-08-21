<script setup>
import { ref, computed, onMounted } from 'vue'
import { Location } from '@element-plus/icons-vue'
import { useCoastalData } from '@/composables/useCoastalData'
import { useSegmentStates } from '@/composables/useSegmentStates'
import { RULES } from '@/data/rules'
import KoreaMap from '@/components/KoreaMap.vue'
import TimeSlider from '@/components/TimeSlider.vue'

const { segments, timeSlots, loading, error, load, forecastOf } = useCoastalData()
const { stateTable } = useSegmentStates(segments, timeSlots, forecastOf, RULES.fishing)

const selectedIndex = ref(0)
const hovered = ref(null)

const statesAtSelected = computed(() => stateTable.value.map((row) => row[selectedIndex.value]))

const summary = computed(() => {
  const counts = { open: 0, caution: 0, nodata: 0, blocked: 0 }
  for (const s of statesAtSelected.value) counts[s.level]++
  return counts
})

onMounted(load)
</script>

<template>
  <div class="coastal-view">
    <section class="view-intro">
      <div>
        <p class="eyebrow"><el-icon><Location /></el-icon> COASTAL ACTIVITY MAP</p>
        <h1>지금, 어디서<br /><em>낚시하기 좋을까</em></h1>
        <p class="intro-copy">한반도 해안을 따라 풍속·파고·강수확률을 규칙으로 판정해 색으로 보여줍니다.</p>
      </div>
    </section>

    <el-alert v-if="error" class="error-box" :title="error" type="error" show-icon :closable="false">
      <template #default>
        <el-button size="small" type="danger" plain @click="load">다시 시도</el-button>
      </template>
    </el-alert>

    <div class="stage-wrap">
      <KoreaMap v-if="segments.length" :segments="segments" :states="statesAtSelected" @hover="hovered = $event" />
      <div v-if="loading" class="skeleton" aria-hidden="true" />
    </div>

    <p class="hover-hint">
      {{ hovered ? `${hovered.name} — ${hovered.level}${hovered.reason.length ? ` (${hovered.reason.join(', ')})` : ''}` : '구간에 마우스를 올리면 상세 사유가 보여요.' }}
    </p>

    <TimeSlider v-if="timeSlots.length" v-model="selectedIndex" :time-slots="timeSlots" />

    <p class="summary">
      활동 가능 {{ summary.open }} · 일부 미충족 {{ summary.caution }} · 데이터 없음 {{ summary.nodata }}
    </p>
  </div>
</template>

<style scoped>
.coastal-view {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.view-intro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 180px;
  padding: 32px 42px;
  border-radius: 24px;
  color: #fff;
  background: linear-gradient(120deg, #0f4c5c, #0d9488);
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #bdf0e6;
  font-size: 0.78rem;
  font-weight: 750;
  letter-spacing: 0.08em;
}

.view-intro h1 {
  margin: 9px 0;
  color: #fff;
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.05em;
}

.view-intro h1 em {
  color: #f6d46c;
  font-style: normal;
}

.intro-copy {
  color: #d7f5ee;
  font-size: 0.9rem;
}

.stage-wrap {
  position: relative;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: #fff;
}

.skeleton {
  position: absolute;
  inset: 0;
  border-radius: 18px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 37%, #e2e8f0 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}

@keyframes shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.hover-hint {
  min-height: 1.2em;
  color: var(--color-text);
  opacity: 0.75;
  font-size: 0.85rem;
}

.summary {
  color: var(--color-text);
  opacity: 0.75;
  font-size: 0.85rem;
}

.error-box {
  margin: 0;
}

@media (max-width: 600px) {
  .view-intro {
    min-height: 160px;
    padding: 26px;
  }
  .view-intro h1 {
    font-size: 1.7rem;
  }
}
</style>
