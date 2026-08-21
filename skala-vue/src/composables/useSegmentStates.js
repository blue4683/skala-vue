import { computed } from 'vue'
import { segmentState } from '@/utils/segmentState'

/**
 * 구간×시각 상태 테이블을 사전 계산한다. 시간 슬라이더 이동은 인덱스 조회일 뿐이라 빠르다.
 * 근거: coastal-map-design.md §6.2
 *
 * 특보 연동(11단계)은 이번 스코프에 없어 warns는 항상 빈 배열이다.
 * @param {import('vue').Ref<Array>} segments
 * @param {number[]} timeSlots
 * @param {(segment: object, timeIndex: number) => object|null} forecastOf
 * @param {Array} activeRules
 */
export function useSegmentStates(segments, timeSlots, forecastOf, activeRules) {
  const stateTable = computed(() =>
    segments.value.map((seg) =>
      timeSlots.map((_, i) => segmentState(forecastOf(seg, i), null, [], activeRules)),
    ),
  )

  return { stateTable }
}
