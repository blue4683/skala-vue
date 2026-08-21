<script setup>
defineProps({
  stops: { type: Array, required: true }, // [string, string]
})
</script>

<template>
  <defs>
    <linearGradient id="sky-gradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" :stop-color="stops[0]" />
      <stop offset="100%" :stop-color="stops[1]" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="1000" height="600" fill="url(#sky-gradient)" />
</template>
