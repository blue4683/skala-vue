<script setup>
import { Search } from '@element-plus/icons-vue'

defineProps({ cityName: { type: String, required: true } })
const emit = defineEmits(['update-query'])
</script>

<template>
  <el-input
    :model-value="cityName"
    placeholder="검색할 도시 이름 입력"
    size="large"
    clearable
    @update:model-value="emit('update-query', $event)"
  >
    <template #prefix
      ><el-icon><Search /></el-icon
    ></template>
  </el-input>
  <p class="city-search-result">
    <template v-if="cityName">`{{ cityName }}` 관련 도시를 찾고 있어요.</template>
    <template v-else>원하는 도시를 검색해 보세요.</template>
  </p>
</template>

<style scoped>
:deep(.el-input__wrapper) {
  background-color: var(--sg-bg-elevated-2);
  box-shadow: 0 0 0 1px var(--sg-border-dark) inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--sg-brand) inset;
}

:deep(.el-input__inner) {
  color: var(--sg-text-inverse-900);
}

:deep(.el-input__inner::placeholder) {
  color: var(--sg-text-inverse-500);
}

:deep(.el-input__prefix) {
  color: var(--sg-text-inverse-500);
}

.city-search-result {
  margin: 10px 0 0;
  font-size: 0.82rem;
  color: var(--sg-text-inverse-500);
}
</style>
