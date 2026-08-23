<script setup>
defineProps({
  modelValue: { type: String, required: true }, // 'recommendation' | 'lightPollution' | 'cloud'
})
const emit = defineEmits(['update:modelValue'])

const LAYERS = [
  { key: 'recommendation', label: '관측 추천' },
  { key: 'lightPollution', label: '광공해' },
  { key: 'cloud', label: '구름' },
]
</script>

<template>
  <div class="layer-toggle" role="group" aria-label="지도 레이어 선택">
    <button
      v-for="layer in LAYERS"
      :key="layer.key"
      type="button"
      class="layer-button"
      :class="{ 'is-active': modelValue === layer.key }"
      :aria-pressed="modelValue === layer.key"
      @click="emit('update:modelValue', layer.key)"
    >
      {{ layer.label }}
    </button>
  </div>
</template>

<style scoped>
.layer-toggle {
  position: relative;
  z-index: 1;
  display: inline-grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(78px, auto);
  align-items: center;
  gap: 4px;
  width: fit-content;
  padding: 4px;
  border: 1px solid var(--sg-border);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.layer-button {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  margin: 0;
  padding: 0 14px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--sg-ink-700);
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 0.15s,
    color 0.15s;
}

.layer-button:hover:not(.is-active) {
  background: var(--sg-brand-soft);
  color: var(--sg-brand-text);
}

.layer-button:focus-visible {
  outline: 2px solid var(--sg-brand);
  outline-offset: 2px;
}

.layer-button.is-active {
  background: var(--sg-brand);
  color: #fff;
}

@media (max-width: 380px) {
  .layer-toggle {
    grid-auto-columns: minmax(68px, auto);
  }

  .layer-button {
    padding-inline: 10px;
  }
}
</style>
