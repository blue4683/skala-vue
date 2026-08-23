<script setup>
import { computed } from 'vue'
import {
  ArrowRight,
  Cloudy,
  Drizzling,
  Lightning,
  Location,
  MostlyCloudy,
  PartlyCloudy,
  Pouring,
  Sunny,
} from '@element-plus/icons-vue'
import { useConfigStore } from '@/stores/configStore'

const props = defineProps({
  city: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})

const emit = defineEmits(['select-card', 'click-detail'])

const configStore = useConfigStore()

const displayTemp = computed(() => {
  const celsius = props.city.weather?.temperatureC
  if (celsius == null) return '–'
  const value = configStore.unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius
  return value.toFixed(1)
})

const WEATHER_ICONS = {
  clear: Sunny,
  'partly-cloudy': PartlyCloudy,
  cloudy: Cloudy,
  fog: MostlyCloudy,
  drizzle: Drizzling,
  rain: Pouring,
  snow: MostlyCloudy,
  thunderstorm: Lightning,
  unknown: Cloudy,
}

const conditionIcon = computed(
  () => WEATHER_ICONS[props.city.weather?.conditionKey] ?? WEATHER_ICONS.unknown,
)
</script>

<template>
  <article
    class="city-card"
    :class="[{ 'is-selected': selected }, `condition-${city.weather?.conditionKey ?? 'unknown'}`]"
    tabindex="0"
    @click="emit('select-card', city)"
    @keydown.enter.prevent="emit('select-card', city)"
    @keydown.space.prevent="emit('select-card', city)"
  >
    <div class="condition-icon" aria-hidden="true">
      <el-icon>
        <component :is="conditionIcon" />
      </el-icon>
    </div>
    <div class="city-info">
      <div class="city-heading">
        <el-icon><Location /></el-icon>
        <strong>{{ city.nameKo }}</strong>
        <span>{{ city.weather?.conditionLabel ?? '날씨 확인 불가' }}</span>
      </div>
      <p class="city-location">{{ city.name }} · {{ city.region }}, {{ city.countryCode }}</p>
      <p v-if="city.weather" class="city-temp">
        <b>{{ displayTemp }}{{ configStore.unitSymbol }}</b>
        <span>습도 {{ city.weather.humidityPercent ?? '–' }}%</span>
        <span>구름 {{ city.weather.cloudPercent ?? '–' }}%</span>
      </p>
      <p v-else class="weather-unavailable">현재 예보를 불러오지 못했습니다.</p>
      <div v-if="city.weather" class="badge-row">
        <el-tag
          :type="city.weather.temperatureC >= 25 ? 'danger' : 'primary'"
          effect="light"
          round
          size="small"
        >
          {{ city.weather.temperatureC >= 25 ? '더움' : '선선함' }}
        </el-tag>
        <el-tag
          v-if="city.discomfortIndex != null"
          type="warning"
          effect="light"
          round
          size="small"
        >
          불쾌지수 {{ city.discomfortIndex.toFixed(1) }} {{ city.discomfortLevel.label }}
        </el-tag>
      </div>
    </div>
    <el-button
      class="detail-button"
      text
      type="primary"
      :aria-label="`${city.nameKo} 상세 날씨 보기`"
      @click.stop="emit('click-detail', city.id)"
    >
      상세 <el-icon class="el-icon--right"><ArrowRight /></el-icon>
    </el-button>
  </article>
</template>

<style scoped>
.city-card {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  min-height: 142px;
  padding: 14px;
  border-radius: 14px;
  background: var(--sg-bg-elevated-2);
  border: 1px solid var(--sg-border-dark);
  cursor: pointer;
  transition:
    border-color 0.15s,
    background-color 0.15s;
}

.city-card:hover,
.city-card:focus-visible,
.city-card.is-selected {
  border-color: var(--sg-brand);
  outline: none;
}

.city-card.is-selected {
  background: rgba(37, 99, 235, 0.12);
}

.condition-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 12px;
  font-size: 1.35rem;
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.condition-rain .condition-icon,
.condition-drizzle .condition-icon {
  background: rgba(37, 99, 235, 0.18);
  color: #60a5fa;
}

.condition-cloudy .condition-icon,
.condition-fog .condition-icon,
.condition-snow .condition-icon,
.condition-unknown .condition-icon {
  background: rgba(148, 163, 184, 0.16);
  color: var(--sg-text-inverse-700);
}

.condition-thunderstorm .condition-icon {
  background: rgba(180, 83, 9, 0.18);
  color: #fbbf24;
}

.city-info {
  flex: 1;
  min-width: 0;
}

.city-heading {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  color: var(--sg-text-inverse-900);
  font-size: 0.95rem;
}

.city-heading .el-icon {
  color: var(--sg-text-inverse-500);
}

.city-heading span {
  color: var(--sg-text-inverse-500);
  font-weight: 400;
  font-size: 0.85rem;
}

.city-location {
  margin: 2px 0 0;
  overflow: hidden;
  color: var(--sg-text-inverse-500);
  font-size: 0.72rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.city-temp {
  margin: 4px 0 8px;
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--sg-text-inverse-500);
}

.weather-unavailable {
  margin: 10px 0 0;
  color: var(--sg-text-inverse-500);
  font-size: 0.82rem;
}

.city-temp b {
  font-size: 1.3rem;
  color: var(--sg-text-inverse-900);
}

.badge-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.detail-button {
  flex-shrink: 0;
}

@media (max-width: 520px) {
  .city-card {
    grid-template-columns: 44px minmax(0, 1fr);
  }

  .detail-button {
    grid-column: 2;
    justify-self: start;
  }
}
</style>
