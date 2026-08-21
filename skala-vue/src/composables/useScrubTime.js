import { ref, computed, onUnmounted } from 'vue'

export function useScrubTime() {
  const nowMs = ref(Date.now())
  const scrubMs = ref(null)

  const isScrubbing = computed(() => scrubMs.value !== null)
  const targetMs = computed(() => scrubMs.value ?? nowMs.value)

  // 스크럽 중에도 실시각은 계속 흐른다
  const timer = setInterval(() => {
    nowMs.value = Date.now()
  }, 60_000)
  onUnmounted(() => clearInterval(timer))

  const scrubTo = (ms) => {
    scrubMs.value = ms
  }
  const reset = () => {
    scrubMs.value = null
  }

  return { nowMs, targetMs, isScrubbing, scrubTo, reset }
}
