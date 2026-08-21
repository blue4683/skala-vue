<script setup>
defineProps({ title: { type: String, required: true } })
</script>

<template>
  <el-card class="dashboard-card" shadow="never">
    <template #header><h3>{{ title }}</h3></template>
    <slot />
  </el-card>
</template>

<style scoped>
.dashboard-card { border: 1px solid var(--color-border); border-radius: 18px; background: rgba(255, 255, 255, 0.96); }
.dashboard-card :deep(.el-card__header) { padding: 17px 20px; border-bottom: 1px solid #edf2f7; }
.dashboard-card :deep(.el-card__body) { padding: 20px; }
.dashboard-card h3 { color: var(--color-heading); font-size: 1rem; font-weight: 750; }
</style>
