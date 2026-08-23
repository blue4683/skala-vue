<script setup>
import { computed } from 'vue'

const props = defineProps({
  sunrise: { type: Number, default: null }, // unix seconds
  sunset: { type: Number, default: null }, // unix seconds
  mode: { type: String, required: true }, // 'normal' | 'polar-day' | 'polar-night'
  targetMs: { type: Number, required: true },
  isScrubbing: { type: Boolean, required: true },
})

const emit = defineEmits(['scrub', 'reset'])

// 극지방 모드이거나 sunrise/sunset이 없으면 슬라이더 대신 안내 문구를 보여준다.
const range = computed(() => {
  if (props.mode !== 'normal' || props.sunrise == null || props.sunset == null) return null
  return { min: props.sunrise * 1000, max: props.sunset * 1000 }
})

const timeLabel = computed(() =>
  new Date(props.targetMs).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
)
</script>

<template>
  <div class="sun-arc-scrubber">
    <template v-if="range">
      <el-slider
        :model-value="targetMs"
        :min="range.min"
        :max="range.max"
        :show-tooltip="false"
        @input="emit('scrub', $event)"
      />
      <div class="scrub-info">
        <span>{{ timeLabel }}</span>
        <el-button v-if="isScrubbing" text type="primary" size="small" @click="emit('reset')">
          지금으로
        </el-button>
      </div>
    </template>
    <p v-else class="polar-note">
      {{
        mode === 'polar-day'
          ? '백야 지역이라 하루 종일 해가 지지 않아요.'
          : '극야 지역이라 하루 종일 해가 뜨지 않아요.'
      }}
    </p>
  </div>
</template>

<style scoped>
.scrub-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
