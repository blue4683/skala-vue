<script setup>
defineProps({
  opacity: { type: Number, required: true }, // 0~0.4, hazeOpacity
})
</script>

<template>
  <rect x="0" y="0" width="1000" height="600" fill="#CBD5E1" :opacity="opacity" />
</template>
