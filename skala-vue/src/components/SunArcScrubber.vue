<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  sunrise: { type: Number, default: null }, // 초 단위 unix time
  sunset: { type: Number, default: null }, // 초 단위 unix time
  mode: { type: String, default: 'normal' }, // 'normal' | 'polar-day' | 'polar-night'
  targetMs: { type: Number, required: true },
  isScrubbing: { type: Boolean, default: false },
})

const emit = defineEmits(['scrub', 'reset'])

const trackEl = ref(null)
let dragging = false

const disabled = computed(() => props.mode !== 'normal' || props.sunrise == null || props.sunset == null)

const currentSec = computed(() => props.targetMs / 1000)

const progress = computed(() => {
  if (disabled.value) return 0.5
  const p = (currentSec.value - props.sunrise) / (props.sunset - props.sunrise)
  return Math.min(1, Math.max(0, p))
})

const timeLabel = computed(() =>
  new Date(props.targetMs).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' }),
)

const sunriseLabel = computed(() =>
  new Date(props.sunrise * 1000).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' }),
)

const sunsetLabel = computed(() =>
  new Date(props.sunset * 1000).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' }),
)

function msFromProgress(p) {
  return (props.sunrise + p * (props.sunset - props.sunrise)) * 1000
}

function updateFromX(clientX) {
  if (disabled.value || !trackEl.value) return
  const rect = trackEl.value.getBoundingClientRect()
  const p = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  emit('scrub', msFromProgress(p))
}

function onPointerDown(e) {
  if (disabled.value) return
  e.target.setPointerCapture(e.pointerId)
  dragging = true
  updateFromX(e.clientX)
}
function onPointerMove(e) {
  if (dragging) updateFromX(e.clientX)
}
function onPointerUp(e) {
  if (!dragging) return
  e.target.releasePointerCapture(e.pointerId)
  dragging = false
}

function step(minutes) {
  if (disabled.value) return
  const next = props.targetMs + minutes * 60_000
  const clamped = Math.min(props.sunset * 1000, Math.max(props.sunrise * 1000, next))
  emit('scrub', clamped)
}

function onReset() {
  emit('reset')
}
</script>

<template>
  <div class="scrubber">
    <p v-if="disabled" class="polar-note">
      이 지역은 지금 {{ mode === 'polar-night' ? '극야' : '백야' }}입니다. 해가 뜨지 않아 궤적을 표시할 수
      없습니다.
    </p>

    <template v-else>
      <div class="scrubber-header">
        <div>
          <p class="eyebrow">SKY POSITION</p>
          <strong>{{ timeLabel }}</strong><span>의 하늘</span>
        </div>
        <div class="daylight-window"><span>일출 {{ sunriseLabel }}</span><i /><span>일몰 {{ sunsetLabel }}</span></div>
      </div>
      <div
        ref="trackEl"
        class="track"
        role="slider"
        tabindex="0"
        :aria-valuemin="sunrise"
        :aria-valuemax="sunset"
        :aria-valuenow="Math.round(currentSec)"
        :aria-valuetext="`${timeLabel}의 하늘`"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @keydown.left.prevent="step(-15)"
        @keydown.right.prevent="step(15)"
      >
        <div class="track-fill" :style="{ width: progress * 100 + '%' }" />
        <div class="handle" :style="{ left: progress * 100 + '%' }"><span>☀</span></div>
      </div>

      <div class="caption">
        <span>트랙을 드래그하거나 <kbd>←</kbd> <kbd>→</kbd> 키로 15분씩 이동할 수 있어요.</span>
        <el-button v-if="isScrubbing" type="button" class="reset-btn" size="small" plain @click="onReset">
          현재 시각으로 돌아가기
        </el-button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.scrubber {
  margin: 0;
  padding: 18px 20px 16px;
  border: 1px solid #d8e8f5;
  border-radius: 16px;
  background: linear-gradient(180deg, #f7fcff 0%, #eef7fd 100%);
}

.scrubber-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 22px; }
.eyebrow { margin-bottom: 3px; color: #5590bd; font-size: .68rem; font-weight: 800; letter-spacing: .1em; }
.scrubber-header strong { color: #183a5e; font-size: 1.2rem; font-weight: 800; letter-spacing: -.04em; }
.scrubber-header > div:first-child span { margin-left: 3px; color: #6e89a3; font-size: .88rem; }
.daylight-window { display: flex; align-items: center; gap: 7px; color: #6c87a0; font-size: .72rem; white-space: nowrap; }
.daylight-window i { display: block; width: 15px; height: 1px; background: #afc9df; }

.track::before {
  content: '';
  position: absolute;
  z-index: 0;
  left: 8%;
  right: 8%;
  bottom: 50%;
  height: 32px;
  border: 1px dashed rgba(79, 147, 199, .32);
  border-bottom: 0;
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
}

.track {
  position: relative;
  height: 10px;
  border-radius: 999px;
  background: #d7e7f3;
  cursor: pointer;
  touch-action: none;
}

.track:focus-visible {
  outline: 2px solid #2575c4;
  outline-offset: 4px;
}

.track-fill {
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #6eb7e7, #f4bf4e);
  pointer-events: none;
}

.handle {
  z-index: 2;
  position: absolute;
  top: 50%;
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 50%;
  background: #fffdf4;
  border: 3px solid #f0b83e;
  box-shadow: 0 4px 10px rgba(230, 167, 45, .28);
  transform: translate(-50%, -50%);
  pointer-events: none;
}
.handle span { font-size: .88rem; line-height: 1; }

.caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 15px;
  color: #66829d;
  font-size: 0.75rem;
}

kbd { padding: 1px 4px; border: 1px solid #cbdcea; border-radius: 4px; color: #55738d; background: #fff; font-family: inherit; font-size: .7rem; }

.polar-note {
  font-size: 0.875rem;
  padding: 13px 15px;
  border: 1px dashed #a9cbe4;
  border-radius: 12px;
  color: #54718b;
  background: #f5faff;
}

@media (max-width: 540px) {
  .scrubber-header { align-items: flex-start; flex-direction: column; }
  .caption { align-items: flex-start; flex-direction: column; }
}
</style>
