import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useConfigStore = defineStore('configStore', () => {
  const unit = ref('celsius')
  const unitSymbol = computed(() => (unit.value == 'celsius' ? '℃' : '℉'))
  function toggleUnit() {
    unit.value = unit.value == 'celsius' ? 'fahrenheit' : 'celsius'
  }

  return { unit, unitSymbol, toggleUnit }
})
