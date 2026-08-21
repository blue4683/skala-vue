import { ref } from 'vue'
import { fetchOneCall } from '@/api/weather'
import { normalizeCurrentWeather } from '@/api/normalizeWeather'

export function useWeather() {
  const raw = ref(null)
  const loading = ref(false)
  const error = ref(null)

  /**
   * @param {number} lat
   * @param {number} lon
   */
  async function load(lat, lon) {
    loading.value = true
    error.value = null
    try {
      raw.value = normalizeCurrentWeather(await fetchOneCall(lat, lon))
    } catch (e) {
      error.value = e instanceof Error ? e.message : '알 수 없는 오류'
    } finally {
      loading.value = false
    }
  }

  /** @param {import('@/types/weather').OneCallResponse} mock */
  function loadMock(mock) {
    raw.value = mock
  }

  return { raw, loading, error, load, loadMock }
}
