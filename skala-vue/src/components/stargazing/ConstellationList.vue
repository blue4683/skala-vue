<script setup>
import { computed } from 'vue'

const props = defineProps({
  constellations: { type: Array, required: true }, // useObservationScore가 만드는 constellations 배열
})

const STATE_LABEL = { clear: '선명', visible: '관측 가능', difficult: '관측 어려움' }
const STATE_ORDER = ['clear', 'visible', 'difficult']

const COMPASS = ['북', '북동', '동', '남동', '남', '남서', '서', '북서']
function compassLabel(azimuthDegrees) {
  const index = Math.round(azimuthDegrees / 45) % 8
  return COMPASS[index]
}

const groups = computed(() =>
  STATE_ORDER.map((state) => ({
    state,
    label: STATE_LABEL[state],
    items: props.constellations.filter((c) => c.state === state),
  })).filter((g) => g.items.length > 0),
)
</script>

<template>
  <div class="constellation-list">
    <section v-for="g in groups" :key="g.state" class="constellation-group">
      <h4 :class="`state-${g.state}`">{{ g.label }} ({{ g.items.length }})</h4>
      <ul>
        <li v-for="c in g.items" :key="c.id">
          <strong>{{ c.nameKo }}</strong>
          <span v-if="c.altitudeDegrees >= 0">
            {{ compassLabel(c.azimuthDegrees) }}쪽 {{ Math.round(c.azimuthDegrees) }}° · 고도
            {{ Math.round(c.altitudeDegrees) }}°
          </span>
          <span v-else>지평선 아래</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.constellation-group h4 {
  margin: 12px 0 4px;
  font-size: 0.85rem;
}
.state-clear {
  color: var(--sg-accent);
}
.state-visible {
  color: var(--sg-warning);
}
.state-difficult {
  color: var(--sg-ink-500);
}
.constellation-group ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.constellation-group li {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--sg-ink-700);
}
</style>
