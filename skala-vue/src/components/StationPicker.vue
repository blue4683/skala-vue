<script setup>
const props = defineProps({
  stations: { type: Array, required: true },
  selected: { type: Object, default: null }, // 현재 선택된 station
})

const emit = defineEmits(['select'])
</script>

<template>
  <el-radio-group class="station-picker" :model-value="props.selected?.obsCode" aria-label="관측소 선택">
    <el-radio-button v-for="s in stations" :key="s.obsCode" :value="s.obsCode" @click="emit('select', s)">{{ s.name }}</el-radio-button>
  </el-radio-group>
</template>

<style scoped>
.station-picker { display: flex; flex-wrap: wrap; }
</style>
