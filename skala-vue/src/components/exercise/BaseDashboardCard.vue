<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <el-card class="dashboard-card" shadow="never">
    <template #header
      ><h3>{{ title }}</h3></template
    >
    <slot></slot>
  </el-card>
</template>

<style scoped>
.dashboard-card {
  --el-card-bg-color: var(--sg-bg-elevated);
  --el-card-border-color: var(--sg-border-dark);
  border-radius: 16px;
}

.dashboard-card :deep(.el-card__header) {
  border-bottom-color: var(--sg-border-dark);
}

.dashboard-card :deep(h3) {
  margin: 0;
  font-size: 0.95rem;
  color: var(--sg-text-inverse-900);
}
</style>
