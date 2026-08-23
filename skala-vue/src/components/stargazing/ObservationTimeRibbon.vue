<script setup>
const props = defineProps({
  timeSlots: { type: Array, required: true }, // Date[]
  modelValue: { type: Date, required: true },
  hourlyScores: { type: Array, default: () => [] }, // [{time, score}] for the selected site, optional
  timezone: { type: String, default: undefined },
})
const emit = defineEmits(['update:modelValue'])

function label(date) {
  return date.toLocaleTimeString('ko-KR', {
    hour: 'numeric',
    hour12: false,
    timeZone: props.timezone,
  })
}

function isSelected(date) {
  return date.getTime() === props.modelValue.getTime()
}

function scoreAt(date) {
  return props.hourlyScores.find((h) => h.time === date.getTime())?.score ?? null
}
</script>

<template>
  <div class="time-ribbon" role="group" aria-label="오늘 밤 관측 시간 선택">
    <button
      v-for="t in timeSlots"
      :key="t.getTime()"
      type="button"
      class="time-slot"
      :class="{ 'is-selected': isSelected(t) }"
      @click="emit('update:modelValue', t)"
    >
      <span class="time-slot-hour">{{ label(t) }}</span>
      <span v-if="scoreAt(t) !== null" class="time-slot-score">{{ scoreAt(t) }}</span>
    </button>
  </div>
</template>

<style scoped>
.time-ribbon {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 4px 0;
}

.time-slot {
  flex: 1 0 auto;
  min-width: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 10px;
  border: 1px solid var(--sg-border-dark);
  border-radius: 10px;
  background: var(--sg-bg-elevated-2);
  color: var(--sg-text-inverse-700);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.15s,
    border-color 0.15s,
    color 0.15s;
}

.time-slot-score {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--sg-text-inverse-500);
}

.time-slot:hover {
  border-color: var(--sg-brand);
  color: var(--sg-text-inverse-900);
}

.time-slot:focus-visible {
  outline: 2px solid var(--sg-brand);
  outline-offset: 2px;
}

.time-slot.is-selected {
  border-color: var(--sg-brand);
  background: var(--sg-brand);
  color: #fff;
}

.time-slot.is-selected .time-slot-score {
  color: rgba(255, 255, 255, 0.85);
}

.time-slot.is-selected:hover {
  color: #fff;
}
</style>
