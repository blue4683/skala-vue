<script setup>
import ObservationFactors from './ObservationFactors.vue'
import ConstellationList from './ConstellationList.vue'

defineProps({
  site: { type: Object, required: true }, // stargazingSites.json의 항목
  evaluation: { type: Object, required: true }, // useObservationScore의 결과
  bestWindow: { type: Object, default: null }, // {start, end, averageScore} | null
  requestedAt: { type: Date, required: true },
})

const STATUS_LABEL = { recommended: '추천', conditional: '조건부', unavailable: '추천 불가' }

function timeLabel(ms) {
  return new Date(ms).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })
}
</script>

<template>
  <aside class="site-detail-panel" aria-label="장소 상세">
    <header>
      <h3>{{ site.name }}<span class="region">{{ site.region }}</span></h3>
      <p class="requested-at">기준 시각 {{ requestedAt.toLocaleString('ko-KR') }}</p>
    </header>

    <div class="status-row" :class="`is-${evaluation.status}`">
      <span class="status-badge">{{ STATUS_LABEL[evaluation.status] }}</span>
      <span v-if="evaluation.score !== null" class="score">{{ evaluation.score }}점</span>
      <span v-else class="reason">{{ evaluation.reason }}</span>
    </div>

    <p v-if="bestWindow" class="best-window">
      오늘 밤 추천 시간: {{ timeLabel(bestWindow.start) }} ~ {{ timeLabel(bestWindow.end) }} (평균
      {{ bestWindow.averageScore }}점)
    </p>

    <section>
      <h4>근거</h4>
      <ObservationFactors :factors="evaluation.factors" />
    </section>

    <section v-if="evaluation.constellations.length">
      <h4>별자리</h4>
      <ConstellationList :constellations="evaluation.constellations" />
    </section>

    <footer>
      <p class="confidence-note">
        어두움 등급은 실측 SQM이 아닌 지형 기반 추정치({{ site.verifiedAt }} 작성), 날씨는 목업
        데이터입니다.
      </p>
      <p v-if="site.accessNote" class="access-note">{{ site.accessNote }}</p>
    </footer>
  </aside>
</template>

<style scoped>
.site-detail-panel {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border-radius: 16px;
  background: var(--sg-glass);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--sg-border);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.45);
}

h3 {
  margin: 2px 0;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
}

.region {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--sg-ink-500);
}

.requested-at {
  margin: 0;
  font-size: 0.75rem;
  color: var(--sg-ink-500);
}

.status-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.status-badge {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--sg-neutral-soft);
  color: var(--sg-neutral);
}

.status-row.is-recommended .status-badge {
  background: var(--sg-accent-soft);
  color: var(--sg-accent);
}
.status-row.is-conditional .status-badge {
  background: var(--sg-warning-soft);
  color: var(--sg-warning);
}
.status-row.is-unavailable .status-badge {
  background: var(--sg-neutral-soft);
  color: var(--sg-neutral);
}

.score {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--sg-ink-900);
}

.reason {
  color: var(--sg-ink-500);
  font-size: 0.85rem;
}

.best-window {
  margin: 0;
  font-size: 0.82rem;
  color: var(--sg-ink-700);
}

h4 {
  margin: 0 0 6px;
  font-size: 0.82rem;
  color: var(--sg-ink-700);
}

footer {
  border-top: 1px dashed var(--sg-border);
  padding-top: 10px;
}

.confidence-note,
.access-note {
  margin: 0 0 4px;
  font-size: 0.72rem;
  color: var(--sg-ink-500);
}
</style>
