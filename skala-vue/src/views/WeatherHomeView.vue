<script setup>
import {computed, watch, watchEffect, ref} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'
import {Location, Sunny, Warning} from '@element-plus/icons-vue'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue';
import SearchBar from '@/components/exercise/SearchBar.vue';
import WeatherCard from '@/components/exercise/WeatherCard.vue';

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
    ElMessage({message: `${city.name}의 날씨를 선택했어요.`, type: 'success', grouping: true})
}

const showDetail = (cityId) => {
    router.push('/weather/' + cityId)
}

const filteredWeatherList = computed(() => (
    cityName.value
    ? weatherList.value.filter((city) => city.name.includes(cityName.value))
    : weatherList.value
).map((city) => {
    const discomfortIndex = getDiscomfortIndex(city.temp, city.humidity)
    return {
        ...city,
        discomfortIndex,
        discomforLevel: getDiscomfortLevel(discomfortIndex),
    }
}))

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
        <section class="dashboard-hero">
            <div>
                <p class="eyebrow"><el-icon><Location /></el-icon> 대한민국 주요 도시</p>
                <h1>오늘의 날씨,<br /><em>가볍게 확인하세요.</em></h1>
                <p class="hero-copy">기온과 습도, 불쾌지수를 한 화면에서 비교해 보세요.</p>
            </div>
            <div class="hero-weather" aria-hidden="true"><el-icon><Sunny /></el-icon><span>28º</span></div>
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
                <el-empty v-if="!filteredWeatherList.length" description="일치하는 도시가 없습니다." :image-size="70"></el-empty>
            </BaseDashboardCard>
        </section>

        <el-alert class="status-banner" :title="statusMessage" type="info" :closable="false" show-icon>
            <template #icon><el-icon><Warning /></el-icon></template>
        </el-alert>
    </div>
</template>

<style scoped>
</style>