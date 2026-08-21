<script setup>
import { useConfigStore } from '@/stores/configStore'
const configStore = useConfigStore()
</script>

<template>
  <el-button plain size="small" class="unit-toggle" @click="configStore.toggleUnit">
    {{ configStore.unit === 'fahrenheit' ? '℉ 화씨' : '℃ 섭씨' }}
  </el-button>
</template>

<style scoped>
.unit-toggle { font-weight: 700; }
</style>
