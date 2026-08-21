<script setup>
defineProps({
    title: {
        type: String, required: true
    }
})
</script>

<template>
    <el-card class="dashboard-card" shadow="never">
        <template #header><h3>{{ title }}</h3></template>
        <slot></slot>
    </el-card>
</template>

<style scoped>
</style>