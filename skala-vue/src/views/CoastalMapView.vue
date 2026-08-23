<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCoastalData } from '@/composables/useCoastalData'
import { useSegmentStates } from '@/composables/useSegmentStates'
import { RULES } from '@/data/rules'
import KoreaMap from '@/components/KoreaMap.vue'
import TimeSlider from '@/components/TimeSlider.vue'

const { segments, timeSlots, loading, error, load, forecastOf } = useCoastalData()
const { stateTable } = useSegmentStates(segments, timeSlots, forecastOf, RULES.fishing)

const selectedIndex = ref(0)
const hovered = ref(null)

// 2차원 테이블에서 현재 시각 열만 뽑는다 — 이게 슬라이더 이동의 전부다
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
    <div class="starfield" aria-hidden="true" />
    <div class="nebula" aria-hidden="true" />

    <div class="content">
      <section class="view-intro">
        <h1>지금, 어디서<br /><em>낚시하기 좋을까</em></h1>
        <p class="intro-copy">
          한반도 해안을 따라 풍속·파고·강수확률을 규칙으로 판정해 색으로 보여줍니다.
        </p>
      </section>

      <el-alert
        v-if="error"
        class="error-box"
        :title="error"
        type="error"
        show-icon
        :closable="false"
      >
        <template #default>
          <el-button size="small" type="danger" plain @click="load">다시 시도</el-button>
        </template>
      </el-alert>

      <div class="stage-wrap">
        <KoreaMap
          v-if="segments.length"
          :segments="segments"
          :states="statesAtSelected"
          @hover="hovered = $event"
        />
        <div v-if="loading" class="skeleton" aria-hidden="true" />
      </div>

      <p class="hover-hint">
        {{
          hovered
            ? `${hovered.name} — ${hovered.level}${hovered.reason.length ? ` (${hovered.reason.join(', ')})` : ''}`
            : '구간에 마우스를 올리면 상세 사유가 보여요.'
        }}
      </p>

      <TimeSlider v-if="timeSlots.length" v-model="selectedIndex" :time-slots="timeSlots" />

      <p class="summary">
        활동 가능 {{ summary.open }} · 일부 미충족 {{ summary.caution }} · 데이터 없음
        {{ summary.nodata }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.coastal-view {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 24px;
  border-radius: 20px;
  color-scheme: dark;
}

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
  top: -200px;
  right: -120px;
  width: 560px;
  height: 560px;
  border-radius: 50%;
  filter: blur(70px);
  pointer-events: none;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.3), transparent 70%);
}

.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
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

.hover-hint,
.summary {
  margin: 0;
  color: var(--sg-text-inverse-700);
}

.skeleton {
  position: absolute;
  inset: 0;
  border-radius: 18px;
  background: linear-gradient(
    90deg,
    var(--sg-bg-elevated) 25%,
    var(--sg-bg-elevated-2) 37%,
    var(--sg-bg-elevated) 63%
  );
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

.stage-wrap {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--sg-border-dark);
  background: var(--sg-bg-elevated);
}

@media (max-width: 640px) {
  .coastal-view {
    padding: 16px;
  }
}
</style>
