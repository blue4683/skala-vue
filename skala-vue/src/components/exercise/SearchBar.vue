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

<style scoped></style>
