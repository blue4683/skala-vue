<script setup>
import { computed, watch, watchEffect, ref } from 'vue'
import { useRouter } from 'vue-router'
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
    <div class="weather-mockup">
        <header class="mockup-header">
            <h2>☁️ 날씨 대시보드</h2>
        </header>

        <BaseDashboardCard title="🔍 도시 검색">
            <SearchBar :city-name="cityName" @update-query="cityName = $event" />
        </BaseDashboardCard>

        <BaseDashboardCard title="🌤️ 지역별 날씨 현황">
            <WeatherCard
                v-for="city in filteredWeatherList"
                :key="city.id"
                :city="city"
                @select-card="selectCity"
                @click-detail="showDetail"
            />
        </BaseDashboardCard>

        <div class="status-banner">
            {{ statusMessage }}
        </div>
    </div>
</template>

<style scoped>
.weather-mockup {
    max-width: 560px;
    margin: 0 auto;
    border: 1px solid #e2e5eb;
    border-radius: 12px;
    overflow: hidden;
    background-color: #fff;
}

.mockup-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #e2e5eb;
}

.mockup-header h2 {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    color: #1f2430;
}

.status-banner {
    margin: 1rem 1.5rem 1.5rem;
    padding: 0.75rem 1rem;
    background-color: #e5f5ea;
    color: #2f8a4b;
    font-weight: 700;
    text-align: center;
    border-radius: 8px;
}
</style>
