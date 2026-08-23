<script setup>
import { computed } from 'vue'
import { ArrowRight, Location } from '@element-plus/icons-vue'
import { useConfigStore } from '@/stores/configStore'

const props = defineProps({
  city: { type: Object, required: true },
})

const emit = defineEmits(['select-card', 'click-detail'])

const configStore = useConfigStore()

const displayTemp = computed(() => {
  const celsius = props.city.temp
  const value = configStore.unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius
  return value.toFixed(1)
})
</script>

<template>
  <article class="city-card" tabindex="0" @click="emit('select-card', city)">
    <div
      class="condition-icon"
      :class="{ rainy: city.status === '비', cloudy: city.status === '구름' }"
    >
      {{ city.status === '비' ? '☔️' : city.status === '구름' ? '☁️' : '☀️' }}
    </div>
    <div class="city-info">
      <div class="city-heading">
        <el-icon><Location /></el-icon>
        <strong>{{ city.name }}</strong>
        <span>{{ city.status }}</span>
      </div>
      <p class="city-temp">
        <b>{{ displayTemp }}{{ configStore.unitSymbol }}</b>
        <span>습도 {{ city.humidity }}%</span>
      </p>
      <div class="badge-row">
        <el-tag :type="city.temp >= 25 ? 'danger' : 'primary'" effect="light" round size="small">
          {{ city.temp >= 25 ? '더움' : '선선함' }}
        </el-tag>
        <el-tag type="warning" effect="light" round size="small">
          불쾌지수 {{ city.discomfortIndex.toFixed(1) }} {{ city.discomforLevel.label }}
        </el-tag>
      </div>
    </div>
    <el-button
      class="detail-button"
      text
      type="primary"
      @click.stop="emit('click-detail', city.name)"
    >
      상세 <el-icon class="el-icon--right"><ArrowRight /></el-icon>
    </el-button>
  </article>
</template>

<style scoped>
.city-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border-radius: 14px;
  background: var(--sg-bg-elevated-2);
  border: 1px solid var(--sg-border-dark);
  cursor: pointer;
  transition:
    border-color 0.15s,
    background-color 0.15s;
}

.city-card + .city-card {
  margin-top: 10px;
}

.city-card:hover,
.city-card:focus-visible {
  border-color: var(--sg-brand);
  outline: none;
}

.condition-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 50%;
  font-size: 1.3rem;
  background: rgba(251, 191, 36, 0.15);
}

.condition-icon.rainy {
  background: var(--sg-brand-soft);
}

.condition-icon.cloudy {
  background: var(--sg-neutral-soft);
}

.city-info {
  flex: 1;
  min-width: 0;
}

.city-heading {
  display: flex;
  align-items: center;
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

.city-temp {
  margin: 4px 0 8px;
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--sg-text-inverse-500);
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
</style>
