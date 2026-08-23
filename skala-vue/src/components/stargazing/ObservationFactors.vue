<script setup>
defineProps({
  factors: { type: Object, required: true }, // useObservationScore가 만드는 factors 객체
})
</script>

<template>
  <ul class="factor-list">
    <li>
      <span class="factor-name">어두움</span>
      <span class="factor-value">{{ factors.darkness.score }}점</span>
      <span class="factor-note" v-if="factors.darkness.bortleEstimate != null">
        Bortle {{ factors.darkness.bortleEstimate }} 추정
      </span>
    </li>
    <li>
      <span class="factor-name">구름</span>
      <span class="factor-value">{{ factors.cloud.score }}점</span>
      <span class="factor-note">총 운량 {{ factors.cloud.totalPercent }}%</span>
    </li>
    <li>
      <span class="factor-name">달빛</span>
      <span class="factor-value">{{ factors.moon.score }}점</span>
      <span class="factor-note">
        조도 {{ factors.moon.illuminationPercent }}% ·
        {{
          factors.moon.altitudeDegrees >= 0
            ? `고도 ${factors.moon.altitudeDegrees}°`
            : '지평선 아래'
        }}
      </span>
    </li>
    <li>
      <span class="factor-name">시정</span>
      <span class="factor-value">{{ factors.visibility.score }}점</span>
      <span class="factor-note">{{ (factors.visibility.meters / 1000).toFixed(1) }}km</span>
    </li>
    <li>
      <span class="factor-name">쾌적함</span>
      <span class="factor-value">{{ factors.comfort.score }}점</span>
      <span class="factor-note">
        풍속 {{ factors.comfort.windSpeedMps }}m/s · 기온 {{ factors.comfort.temperatureC }}℃
      </span>
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
  gap: 8px;
}

.factor-list li {
  display: grid;
  grid-template-columns: 3.5em 3em 1fr;
  align-items: baseline;
  gap: 8px;
  font-size: 0.85rem;
}

.factor-name {
  color: #55738d;
  font-weight: 600;
}

.factor-value {
  font-weight: 700;
  color: #183a5e;
}

.factor-note {
  color: #7c93a8;
}
</style>
