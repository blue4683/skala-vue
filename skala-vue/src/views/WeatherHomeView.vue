<script setup>
import { computed, watch, watchEffect, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Location, Sunny, Warning } from '@element-plus/icons-vue'
import BaseDashboardCard from '../components/exercise/BaseDashboardCard.vue'
import SearchBar from '../components/exercise/SearchBar.vue'
import WeatherCard from '../components/exercise/WeatherCard.vue'

const router = useRouter()

const weatherList = ref([
    { id: 'city_01', name: '서울', temp: 28, humidity: 65, status: '맑음'},
    { id: 'city_02', name: '수원', temp: 24, humidity: 80, status: '비'},
    { id: 'city_03', name: '부산', temp: 26, humidity: 70, status: '구름'},
    { id: 'city_04', name: '광주', temp: 24, humidity: 0, status: '맑음'},
])
const cityName = ref('')
const selectedCity = ref(null)

function getDiscomfortIndex(temp, humidity) {
    return 0.81 * temp + 0.01 * humidity * (0.99 * temp - 14.3) + 46.3
}

function getDiscomfortLevel(index) {
    if (index >= 80) return { label: '매우 높음', className: 'badge-di-very-high', emoji: '🥵' }
    if (index >= 75) return { label: '높음', className: 'badge-di-high', emoji: '😖' }
    if (index >= 68) return { label: '보통', className: 'badge-di-normal', emoji: '😐' }
    return { label: '낮음', className: 'badge-di-low', emoji: '😊' }
}

function selectCity(city) {
    selectedCity.value = city
    ElMessage({ message: `${city.name}의 날씨를 선택했어요.`, type: 'success', grouping: true })
}

const statusMessage = computed(() => {
    if (!selectedCity.value) return '카드를 클릭하거나 검색해 보세요.'
    const index = getDiscomfortIndex(selectedCity.value.temp, selectedCity.value.humidity)
    const level = getDiscomfortLevel(index)
    return `${selectedCity.value.name} (${selectedCity.value.status}) 현재 기온: ${selectedCity.value.temp}℃, 습도: ${selectedCity.value.humidity}%, 불쾌지수: ${index.toFixed(1)} ${level.emoji} (${level.label})`
})

const showDetail = (cityId) => {
    router.push('/weather/' + cityId)
}
//  반응형 변수 변화 감시 (watch, watchEffect):
// - selectedCityInfo 감시 (watch 이용): 상태바 문구가 바뀔때 마다 콘솔로그를 작성
// - searchQuery 감시 (watchEffect 이용):
const filteredWeatherList = computed(() =>
    (cityName.value
        ? weatherList.value.filter((city) => city.name.includes(cityName.value))
        : weatherList.value
    ).map((city) => {
        const discomfortIndex = getDiscomfortIndex(city.temp, city.humidity)
        return {
            ...city,
            discomfortIndex,
            discomfortLevel: getDiscomfortLevel(discomfortIndex),
        }
    })
)

watch(
    selectedCity, (newVal, oldVal) => {
        console.log(`도시 선택 변경 ${oldVal != undefined ? oldVal.name : '없음'} -> ${newVal.name}`)
    }
)

watchEffect(() => {
    console.log(`[자동 감지] 검색한 도시: ${cityName.value}`)
})

</script>

<template>
  <div class="weather-dashboard">
    <section class="dashboard-hero">
      <div>
        <p class="eyebrow"><el-icon><Location /></el-icon> 대한민국 주요 도시</p>
        <h1>오늘의 날씨,<br><em>가볍게 확인하세요.</em></h1>
        <p class="hero-copy">기온과 습도, 불쾌지수를 한 화면에서 비교해 보세요.</p>
      </div>
      <div class="hero-weather" aria-hidden="true"><el-icon><Sunny /></el-icon><span>28°</span></div>
    </section>

    <section class="dashboard-grid">
      <BaseDashboardCard title="도시 검색" class="search-panel">
        <SearchBar :city-name="cityName" @update-query="cityName = $event" />
      </BaseDashboardCard>

      <BaseDashboardCard title="지역별 날씨 현황" class="weather-panel">
        <p class="result-count"><b>{{ filteredWeatherList.length }}</b>개 도시의 날씨 정보</p>
        <WeatherCard
          v-for="city in filteredWeatherList"
          :key="city.id"
          :city="city"
          @select-card="selectCity"
          @click-detail="showDetail"
        />
        <el-empty v-if="!filteredWeatherList.length" description="일치하는 도시가 없습니다." :image-size="70" />
      </BaseDashboardCard>
    </section>

    <el-alert class="status-banner" :title="statusMessage" type="info" :closable="false" show-icon>
      <template #icon><el-icon><Warning /></el-icon></template>
    </el-alert>
    </div>
</template>

<style scoped>
.weather-dashboard { max-width: 1000px; margin: 0 auto; }

.dashboard-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 225px;
  padding: 37px 46px;
  border-radius: 24px;
  color: #fff;
  overflow: hidden;
  background: radial-gradient(circle at 87% 17%, rgba(255, 222, 117, 0.96) 0 8%, transparent 8.5%), linear-gradient(118deg, #195b9b 0%, #2d83cb 53%, #72b9e6 100%);
  box-shadow: 0 18px 36px rgba(28, 100, 165, 0.19);
}

.eyebrow { display: flex; align-items: center; gap: 6px; color: #d6ecff; font-size: 0.86rem; font-weight: 700; }
.dashboard-hero h1 { margin-top: 12px; color: #fff; font-size: clamp(2rem, 4vw, 2.85rem); font-weight: 800; line-height: 1.18; letter-spacing: -0.065em; }
.dashboard-hero h1 em { color: #ffebac; font-style: normal; }
.hero-copy { margin-top: 13px; color: #d7ecff; font-size: 0.94rem; }

.hero-weather { display: flex; align-items: center; gap: 9px; padding-right: 8%; color: #fff8d9; font-size: 4.6rem; filter: drop-shadow(0 8px 13px rgba(32, 90, 133, 0.28)); }
.hero-weather :deep(.el-icon) { font-size: inherit; }
.hero-weather span { color: #fff; font-size: 2.6rem; font-weight: 700; letter-spacing: -0.07em; }

.dashboard-grid { display: grid; grid-template-columns: minmax(250px, 0.75fr) minmax(0, 1.55fr); gap: 20px; margin-top: 22px; align-items: start; }
.result-count { margin-bottom: 12px; color: var(--color-muted); font-size: 0.82rem; }
.result-count b { color: #236fae; font-weight: 800; }

.status-banner { margin-top: 20px; border-radius: 14px; }

@media (max-width: 720px) {
  .dashboard-hero { min-height: 205px; padding: 30px; }
  .hero-weather { padding-right: 0; font-size: 3.6rem; }
  .hero-weather span { display: none; }
  .dashboard-grid { grid-template-columns: 1fr; }
}
</style>
