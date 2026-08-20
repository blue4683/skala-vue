<script setup>
import { ref, computed } from 'vue'
import '../assets/challenge.css'

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

const displayWeatherList = computed(() =>
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

function selectCity(city) {
    selectedCity.value = city
}

const statusMessage = computed(() => {
    if (!selectedCity.value) return '카드를 클릭하거나 검색해 보세요.'
    const index = getDiscomfortIndex(selectedCity.value.temp, selectedCity.value.humidity)
    const level = getDiscomfortLevel(index)
    return `${selectedCity.value.name} (${selectedCity.value.status}) 현재 기온: ${selectedCity.value.temp}℃, 습도: ${selectedCity.value.humidity}%, 불쾌지수: ${index.toFixed(1)} ${level.emoji} (${level.label})`
})

const showDetail = (cityName, status) => {
window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
    <div class="weather-mockup">
        <header class="mockup-header">
            <h2>☁️ 과제 1: 날씨 (Mockup)</h2>
        </header>

        <div class="practice-section">
            <h3>🔍 도시 검색</h3>
            <input type="text" v-model.lazy="cityName" placeholder="검색할 도시 이름 입력">
            <p class="city-search-result">검색 중인 도시: {{ cityName }}</p>
        </div>

        <div class="practice-section">
            <h3>🌤️ 지역별 날씨 현황</h3>
            <div
                class="city-card"
                v-for="city in displayWeatherList"
                :key="city.id"
                @click="selectCity(city)"
            >
                <div class="city-info" @click="selectCity(city)">
                    <p class="city-name">{{ city.name }} ({{ city.status }})</p>
                    <p class="city-temp">현재 기온: {{ city.temp }}℃ / 상대습도: {{ city.humidity }}%</p>
                    <div class="badge-row">
                        <span :class="['badge', city.temp >= 25 ? 'badge-hot' : 'badge-cool']">
                            {{ city.temp >= 25 ? '🔥 더움 (25도 이상)' : '❄️ 선선함 (25도 미만)' }}
                        </span>
                        <span :class="['badge', city.discomfortLevel.className]">
                            {{ city.discomfortLevel.emoji }} 불쾌지수 {{ city.discomfortIndex.toFixed(1) }} ({{ city.discomfortLevel.label }})
                        </span>
                    </div>
                </div>
                <button class="btn-external" @click.stop="showDetail(city.name, city.status)">상세보기</button>
            </div>
        </div>

        <div class="status-banner">
            {{ statusMessage }}
        </div>
    </div>
</template>
