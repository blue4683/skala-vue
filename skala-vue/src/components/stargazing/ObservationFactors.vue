<script setup>
defineProps({
  factors: { type: Object, required: true }, // useObservationScore가 만드는 factors 객체
})
</script>

<template>
  <ul class="factor-list">
    <li>
      <div class="factor-head">
        <span class="factor-name">어두움</span>
        <span class="factor-value">{{ factors.darkness.score }}점</span>
      </div>
      <div class="factor-bar"><span :style="{ width: factors.darkness.score + '%' }" /></div>
      <p v-if="factors.darkness.bortleEstimate != null" class="factor-note">
        Bortle {{ factors.darkness.bortleEstimate }} 추정
      </p>
      <p v-else-if="factors.darkness.radianceNanoWatts != null" class="factor-note">
        VIIRS {{ factors.darkness.radianceNanoWatts.toFixed(2) }} nW/sr/cm²
      </p>
    </li>
    <li>
      <div class="factor-head">
        <span class="factor-name">구름</span>
        <span class="factor-value">{{ factors.cloud.score }}점</span>
      </div>
      <div class="factor-bar"><span :style="{ width: factors.cloud.score + '%' }" /></div>
      <p class="factor-note">총 운량 {{ factors.cloud.totalPercent }}%</p>
    </li>
    <li>
      <div class="factor-head">
        <span class="factor-name">달빛</span>
        <span class="factor-value">{{ factors.moon.score }}점</span>
      </div>
      <div class="factor-bar"><span :style="{ width: factors.moon.score + '%' }" /></div>
      <p class="factor-note">
        조도 {{ factors.moon.illuminationPercent }}% ·
        {{
          factors.moon.altitudeDegrees >= 0
            ? `고도 ${factors.moon.altitudeDegrees}°`
            : '지평선 아래'
        }}
      </p>
    </li>
    <li>
      <div class="factor-head">
        <span class="factor-name">시정</span>
        <span class="factor-value">{{ factors.visibility.score }}점</span>
      </div>
      <div class="factor-bar"><span :style="{ width: factors.visibility.score + '%' }" /></div>
      <p class="factor-note">{{ (factors.visibility.meters / 1000).toFixed(1) }}km</p>
    </li>
    <li>
      <div class="factor-head">
        <span class="factor-name">쾌적함</span>
        <span class="factor-value">{{ factors.comfort.score }}점</span>
      </div>
      <div class="factor-bar"><span :style="{ width: factors.comfort.score + '%' }" /></div>
      <p class="factor-note">
        풍속 {{ factors.comfort.windSpeedMps }}m/s · 기온 {{ factors.comfort.temperatureC }}℃
      </p>
    </li>
  </ul>
</template>

<style scoped>
.factor-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.factor-list li {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.85rem;
}

.factor-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.factor-name {
  color: var(--sg-ink-700);
  font-weight: 600;
}

.factor-value {
  font-weight: 700;
  color: var(--sg-ink-900);
}

.factor-bar {
  height: 6px;
  border-radius: 999px;
  background: var(--sg-neutral-soft);
  overflow: hidden;
}

.factor-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--sg-brand);
}

.factor-note {
  margin: 0;
  color: var(--sg-ink-500);
}
</style>
