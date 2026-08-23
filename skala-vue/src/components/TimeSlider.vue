<script setup>
import { computed } from 'vue'

const props = defineProps({
  timeSlots: { type: Array, required: true }, // epoch ms, 3시간 간격
  modelValue: { type: Number, required: true }, // timeSlots 인덱스
})

const emit = defineEmits(['update:modelValue'])

// 단기예보는 3시간 계단형이다. 값을 보간해 매끄럽게 만들지 않는다.
function onInput(e) {
  emit('update:modelValue', Number(e.target.value))
}

const currentLabel = computed(() =>
  new Date(props.timeSlots[props.modelValue]).toLocaleString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }),
)

function tickLabel(ms) {
  // 48시간 구간이라 시각만 표시하면 시작/중간/끝이 같은 시각으로 겹쳐 보인다. 날짜를 함께 표시한다.
  return new Date(ms).toLocaleString('ko-KR', { day: 'numeric', hour: 'numeric' })
}
</script>

<template>
  <div class="time-slider">
    <div class="slider-header">
      <p class="eyebrow">TIME</p>
      <strong>{{ currentLabel }}</strong>
    </div>

    <input
      type="range"
      class="track"
      min="0"
      :max="timeSlots.length - 1"
      step="1"
      :value="modelValue"
      @input="onInput"
    />

    <div class="ticks">
      <span>{{ tickLabel(timeSlots[0]) }}</span>
      <span>{{ tickLabel(timeSlots[Math.floor(timeSlots.length / 2)]) }}</span>
      <span>{{ tickLabel(timeSlots[timeSlots.length - 1]) }}</span>
    </div>
  </div>
</template>

<style scoped>
.track { width: 100%; accent-color: #0d9488; }
.ticks { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--color-text-mute, #64748b); }
</style>
