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
  display: flex;
  flex-wrap: wrap;
}
</style>
