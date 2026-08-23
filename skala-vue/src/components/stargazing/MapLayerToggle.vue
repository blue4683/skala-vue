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
  <el-radio-group
    class="layer-toggle"
    :model-value="modelValue"
    aria-label="지도 레이어 선택"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-radio-button v-for="l in LAYERS" :key="l.key" :value="l.key">{{ l.label }}</el-radio-button>
  </el-radio-group>
</template>

<style scoped>
.layer-toggle {
  position: relative;
  z-index: 1;
  display: inline-flex;
  flex-wrap: wrap;
  width: fit-content;
  padding: 4px;
  border-radius: 999px;
  background: var(--sg-surface);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  --el-radio-button-checked-bg-color: var(--sg-brand);
  --el-radio-button-checked-border-color: var(--sg-brand);
  --el-radio-button-checked-text-color: #fff;
}

.layer-toggle :deep(.el-radio-button__inner) {
  border: none;
  background: transparent;
  color: var(--sg-ink-700);
  box-shadow: none;
}
</style>
