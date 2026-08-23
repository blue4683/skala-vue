<script setup>
import { computed, watch, watchEffect, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Sunny, Warning } from '@element-plus/icons-vue'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'

const router = useRouter()

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, humidity: 65, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, humidity: 80, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, humidity: 70, status: '구름' },
  { id: 'city_04', name: '광주', temp: 24, humidity: 0, status: '맑음' },
])

const cityName = ref('')
const selectedCity = ref(null)

function getDiscomfortIndex(temp, humidity) {
  return 0.81 * temp + 0.01 * humidity * (0.99 * temp - 14.3) + 46.3
}

function getDiscomfortLevel(index) {
  if (index >= 80) return { label: '매우 높음', emoji: '🥵' }
  if (index >= 75) return { label: '높음', emoji: '😖' }
  if (index >= 68) return { label: '보통', emoji: '😐' }
  return { label: '낮음', emoji: '😊' }
}

function selectCity(city) {
  selectedCity.value = city
  ElMessage({ message: `${city.name}의 날씨를 선택했어요.`, type: 'success', grouping: true })
}

const showDetail = (cityId) => {
  router.push('/weather/' + cityId)
}

const filteredWeatherList = computed(() =>
  (cityName.value
    ? weatherList.value.filter((city) => city.name.includes(cityName.value))
    : weatherList.value
  ).map((city) => {
    const discomfortIndex = getDiscomfortIndex(city.temp, city.humidity)
    return {
      ...city,
      discomfortIndex,
      discomforLevel: getDiscomfortLevel(discomfortIndex),
    }
  }),
)

const statusMessage = computed(() => {
  if (!selectedCity.value) return '카드를 클릭하거나 검색해 보세요.'
  const index = getDiscomfortIndex(selectedCity.value.temp, selectedCity.value.humidity)
  const level = getDiscomfortLevel(index)
  return `${selectedCity.value.name} (${selectedCity.value.status}) 현재 기온: ${selectedCity.value.temp}℃, 습도: ${selectedCity.value.status}%, 불쾌지수: ${index.toFixed(1)} ${level.emoji} (${level.label})`
})

watch(selectedCity, (newVal, oldVal) => {
  console.log(`도시 선택 변경 ${oldVal != undefined ? oldVal.name : '없음'} -> ${newVal.name}`)
})

watchEffect(() => {
  console.log(`[자동 감지] 검색한 도시: ${cityName.value}`)
})
</script>

<template>
  <div class="weather-dashboard">
    <div class="starfield" aria-hidden="true" />
    <div class="nebula" aria-hidden="true" />

    <section class="dashboard-hero">
      <div>
        <h1>오늘의 날씨,<br /><em>가볍게 확인하세요.</em></h1>
        <p class="hero-copy">
          대한민국 주요 도시의 기온과 습도, 불쾌지수를 한 화면에서 비교해 보세요.
        </p>
      </div>
      <div class="hero-weather" aria-hidden="true">
        <el-icon><Sunny /></el-icon><span>28º</span>
      </div>
    </section>

    <section class="dashboard-grid">
      <BaseDashboardCard title="도시 검색" class="search-panel">
        <SearchBar :city-name="cityName" @update-query="cityName = $event" />
      </BaseDashboardCard>

      <BaseDashboardCard title="지역별 날씨 현황" class="weather-panel">
        <p class="result-count">
          <b>{{ filteredWeatherList.length }}</b
          >개 도시의 날씨 정보
        </p>
        <WeatherCard
          v-for="city in filteredWeatherList"
          :key="city.id"
          :city="city"
          @select-card="selectCity"
          @click-detail="showDetail"
        />
        <el-empty
          v-if="!filteredWeatherList.length"
          description="일치하는 도시가 없습니다."
          :image-size="70"
        ></el-empty>
      </BaseDashboardCard>
    </section>

    <el-alert class="status-banner" :title="statusMessage" type="info" :closable="false" show-icon>
      <template #icon
        ><el-icon><Warning /></el-icon
      ></template>
    </el-alert>
  </div>
</template>

<style scoped>
.weather-dashboard {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  border-radius: 20px;
  color-scheme: dark;
}

.starfield {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-color: var(--sg-bg);
  background-image:
    radial-gradient(1.4px 1.4px at 20px 30px, var(--sg-star), transparent 100%),
    radial-gradient(1px 1px at 90px 80px, var(--sg-star), transparent 100%),
    radial-gradient(1.6px 1.6px at 150px 40px, var(--sg-star), transparent 100%),
    radial-gradient(1px 1px at 60px 120px, var(--sg-star), transparent 100%),
    radial-gradient(1.2px 1.2px at 180px 150px, var(--sg-star), transparent 100%),
    radial-gradient(1px 1px at 10px 170px, var(--sg-star), transparent 100%);
  background-size: 200px 200px;
  background-repeat: repeat;
}

.nebula {
  position: absolute;
  z-index: 0;
  top: -200px;
  right: -140px;
  width: 480px;
  height: 480px;
  border-radius: 50%;
  filter: blur(70px);
  pointer-events: none;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.28), transparent 70%);
}

.dashboard-hero {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.dashboard-hero h1 {
  margin: 0 0 8px;
  font-size: clamp(1.5rem, 1rem + 2.5vw, 2.25rem);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--sg-text-inverse-900);
}

.dashboard-hero h1 em {
  font-style: normal;
  color: var(--sg-brand);
}

.hero-copy {
  margin: 0;
  max-width: 48ch;
  color: var(--sg-text-inverse-700);
}

.hero-weather {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 999px;
  background: var(--sg-bg-elevated);
  border: 1px solid var(--sg-border-dark);
  color: var(--sg-text-inverse-900);
  font-size: 1.4rem;
  font-weight: 700;
}

.hero-weather .el-icon {
  color: #fbbf24;
}

.dashboard-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 16px;
  align-items: start;
}

.result-count {
  margin: 0 0 12px;
  font-size: 0.85rem;
  color: var(--sg-text-inverse-700);
}

.result-count b {
  color: var(--sg-text-inverse-900);
}

.status-banner {
  position: relative;
  z-index: 1;
  --el-alert-bg-color: var(--sg-bg-elevated);
  border: 1px solid var(--sg-border-dark);
}

.status-banner :deep(.el-alert__title),
.status-banner :deep(.el-alert__icon) {
  color: var(--sg-text-inverse-700);
}

@media (max-width: 860px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .weather-dashboard {
    padding: 16px;
  }
}
</style>
