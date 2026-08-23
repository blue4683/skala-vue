<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Location, Refresh, Warning } from '@element-plus/icons-vue'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import { useGlobalCityWeather } from '@/composables/useGlobalCityWeather'

const router = useRouter()
const { cities, cityWeatherList, loading, initialized, error, updatedAt, loadAll } =
  useGlobalCityWeather()

const cityName = ref('')
const selectedCity = ref(null)

function getDiscomfortIndex(temp, humidity) {
  return 0.81 * temp + 0.01 * humidity * (0.99 * temp - 14.3) + 46.3
}

function getDiscomfortLevel(index) {
  if (index >= 80) return { label: '매우 높음' }
  if (index >= 75) return { label: '높음' }
  if (index >= 68) return { label: '보통' }
  return { label: '낮음' }
}

function selectCity(city) {
  selectedCity.value = city
  ElMessage({ message: `${city.nameKo}의 날씨를 선택했어요.`, type: 'success', grouping: true })
}

function showDetail(cityId) {
  router.push({ name: 'weather-detail', params: { cityId } })
}

const filteredWeatherList = computed(() => {
  const query = cityName.value.trim().toLocaleLowerCase()
  const matches = query
    ? cityWeatherList.value.filter((city) =>
        [city.nameKo, city.name, city.region, city.countryCode, city.nearbyObservationArea]
          .join(' ')
          .toLocaleLowerCase()
          .includes(query),
      )
    : cityWeatherList.value

  return matches.map((city) => {
    const temp = city.weather?.temperatureC
    const humidity = city.weather?.humidityPercent
    if (temp == null || humidity == null) return city

    const discomfortIndex = getDiscomfortIndex(temp, humidity)
    return {
      ...city,
      discomfortIndex,
      discomfortLevel: getDiscomfortLevel(discomfortIndex),
    }
  })
})

const statusMessage = computed(() => {
  if (!selectedCity.value) return '카드를 클릭하거나 검색해 보세요.'
  if (!selectedCity.value.weather) {
    return `${selectedCity.value.nameKo}의 현재 예보를 불러오지 못했습니다.`
  }

  const { temperatureC, humidityPercent, conditionLabel } = selectedCity.value.weather
  const index = getDiscomfortIndex(temperatureC, humidityPercent)
  const level = getDiscomfortLevel(index)
  return `${selectedCity.value.nameKo} · ${conditionLabel} · ${temperatureC}℃ · 습도 ${humidityPercent}% · 불쾌지수 ${index.toFixed(1)} (${level.label})`
})

const updatedLabel = computed(() =>
  updatedAt.value
    ? updatedAt.value.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    : null,
)

onMounted(() => loadAll())
</script>

<template>
  <div class="weather-dashboard">
    <div class="starfield" aria-hidden="true" />
    <div class="nebula" aria-hidden="true" />

    <section class="dashboard-hero">
      <div>
        <h1>오늘의 날씨,<br /><em>가볍게 확인하세요.</em></h1>
        <p class="hero-copy">
          별 관측 지도와 동일한 전 세계 후보 도시의 기온과 습도, 구름 상태를 비교해 보세요.
        </p>
      </div>
      <div class="hero-weather" aria-hidden="true">
        <el-icon><Location /></el-icon><span>{{ cities.length }}곳</span>
      </div>
    </section>

    <section class="dashboard-grid">
      <BaseDashboardCard title="도시 검색" class="search-panel">
        <SearchBar :city-name="cityName" @update-query="cityName = $event" />
        <p class="search-scope">별 관측 지도에 등록된 도시명·국가·지역을 검색합니다.</p>
      </BaseDashboardCard>

      <BaseDashboardCard title="지역별 날씨 현황" class="weather-panel">
        <div class="weather-toolbar">
          <p class="result-count">
            <b>{{ filteredWeatherList.length }}</b
            >개 별 관측 도시
          </p>
          <span v-if="updatedLabel" class="updated-at">{{ updatedLabel }} 기준</span>
        </div>

        <el-alert
          v-if="error"
          class="load-error"
          :title="
            updatedAt
              ? '날씨 갱신에 실패해 기존 예보를 표시합니다.'
              : '날씨 정보를 불러오지 못해 도시 정보만 표시합니다.'
          "
          type="warning"
          :closable="false"
          show-icon
        >
          <template #default>
            <el-button text type="warning" @click="loadAll({ force: true })">
              <el-icon><Refresh /></el-icon> 다시 불러오기
            </el-button>
          </template>
        </el-alert>

        <div
          v-if="!initialized || (loading && !updatedAt)"
          class="weather-skeletons"
          aria-label="날씨 로딩 중"
        >
          <el-skeleton v-for="index in 6" :key="index" :rows="3" animated />
        </div>
        <div v-else class="weather-list">
          <WeatherCard
            v-for="city in filteredWeatherList"
            :key="city.id"
            :city="city"
            :selected="selectedCity?.id === city.id"
            @select-card="selectCity"
            @click-detail="showDetail"
          />
        </div>
        <el-empty
          v-if="initialized && !loading && !filteredWeatherList.length"
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
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.search-panel {
  position: sticky;
  top: 16px;
}

.search-scope {
  margin: 12px 0 0;
  color: var(--sg-text-inverse-500);
  font-size: 0.75rem;
}

.weather-toolbar {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.result-count {
  margin: 0;
  font-size: 0.85rem;
  color: var(--sg-text-inverse-700);
}

.result-count b {
  color: var(--sg-text-inverse-900);
}

.updated-at {
  color: var(--sg-text-inverse-500);
  font-size: 0.72rem;
  white-space: nowrap;
}

.load-error {
  margin-bottom: 12px;
}

.weather-list,
.weather-skeletons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 10px;
}

.weather-skeletons :deep(.el-skeleton) {
  min-height: 142px;
  padding: 16px;
  border: 1px solid var(--sg-border-dark);
  border-radius: 14px;
  background: var(--sg-bg-elevated-2);
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

  .search-panel {
    position: static;
  }
}

@media (max-width: 520px) {
  .weather-list,
  .weather-skeletons {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .weather-dashboard {
    padding: 16px;
  }
}
</style>
