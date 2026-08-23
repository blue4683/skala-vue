<script setup>
const props = defineProps({
  timeSlots: { type: Array, required: true }, // Date[]
  modelValue: { type: Date, required: true },
})
const emit = defineEmits(['update:modelValue'])

function label(date) {
  return date.toLocaleTimeString('ko-KR', { hour: 'numeric', hour12: false })
}

function isSelected(date) {
  return date.getTime() === props.modelValue.getTime()
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
      {{ label(t) }}
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
  padding: 8px 10px;
  border: 1px solid #d8e8f5;
  border-radius: 10px;
  background: #fff;
  color: #35506b;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.time-slot.is-selected {
  border-color: #0d9488;
  background: #0d9488;
  color: #fff;
}
</style>
