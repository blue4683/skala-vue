<script setup>
import { computed } from 'vue'
import { ArrowRight, Location } from '@element-plus/icons-vue'
import { useConfigStore } from '@/stores/configStore'

const props = defineProps({
    city: {
        type: Object,
        required: true,
    },
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
  <article class="city-card" tabindex="0" @click="emit('select-card', city)" @keydown.enter="emit('select-card', city)">
    <div class="condition-icon" :class="{ rainy: city.status === '비', cloudy: city.status === '구름' }">
      {{ city.status === '비' ? '☂' : city.status === '구름' ? '☁' : '☀' }}
    </div>
    <div class="city-info">
      <div class="city-heading"><el-icon><Location /></el-icon><strong>{{ city.name }}</strong><span>{{ city.status }}</span></div>
      <p class="city-temp"><b>{{ displayTemp }}{{ configStore.unitSymbol }}</b><span>습도 {{ city.humidity }}%</span></p>
      <div class="badge-row">
        <el-tag :type="city.temp >= 25 ? 'danger' : 'primary'" effect="light" round size="small">
          {{ city.temp >= 25 ? '더움' : '선선함' }}
        </el-tag>
        <el-tag type="warning" effect="light" round size="small">
          불쾌지수 {{ city.discomfortIndex.toFixed(1) }} · {{ city.discomfortLevel.label }}
        </el-tag>
      </div>
    </div>
    <el-button class="detail-button" text type="primary" @click.stop="emit('click-detail', city.name)">
      상세 <el-icon class="el-icon--right"><ArrowRight /></el-icon>
    </el-button>
  </article>
</template>

<style scoped>
.city-card {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px 16px;
    margin-top: 10px;
    background: #fff;
    border: 1px solid #e7eef5;
    border-radius: 14px;
    cursor: pointer;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.city-card:hover {
    border-color: #b9d7ef;
    box-shadow: 0 10px 22px rgba(39, 93, 139, 0.09);
    transform: translateY(-1px);
}

.city-card:first-of-type {
    margin-top: 0;
}

.city-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 7px;
}

.condition-icon {
    display: grid;
    width: 44px;
    height: 44px;
    flex: none;
    place-items: center;
    border-radius: 14px;
    color: #d88213;
    background: #fff4d6;
    font-size: 1.4rem;
}

.condition-icon.rainy { color: #327ec8; background: #e5f2ff; }
.condition-icon.cloudy { color: #768ba1; background: #edf2f7; }

.city-heading { display: flex; align-items: center; gap: 5px; color: var(--color-muted); font-size: 0.83rem; }
.city-heading strong { color: var(--color-heading); font-size: 1rem; }
.city-heading span::before { content: '·'; margin-right: 5px; color: #a2b1c1; }

.city-temp { display: flex; align-items: baseline; gap: 9px; color: var(--color-muted); font-size: 0.82rem; }
.city-temp b { color: #1b3350; font-size: 1.25rem; letter-spacing: -0.04em; }
.city-temp span { white-space: nowrap; }

.badge-row {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}

.detail-button {
    flex-shrink: 0;
    font-weight: 600;
}

@media (max-width: 480px) {
  .detail-button { display: none; }
  .city-card { padding: 13px; }
}
</style>
