<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

const mockWeatherList = [
    { id: 'city_01', name: '서울', temp: 28, humidity: 65, status: '맑음'},
    { id: 'city_02', name: '수원', temp: 24, humidity: 80, status: '비'},
    { id: 'city_03', name: '부산', temp: 26, humidity: 70, status: '구름'},
    { id: 'city_04', name: '광주', temp: 24, humidity: 0, status: '맑음'},
]

const route = useRoute()
const city = ref(null)

onMounted(() => {
    city.value = mockWeatherList.find((c) => c.id === route.params.cityId) ?? null
})
</script>

<template>
    <div class="detail-view">
        <RouterLink to="/" class="back-link">← 메인 대시보드로 돌아가기</RouterLink>

        <template v-if="city">
            <h2>{{ city.name }} 상세 기상관측 정보</h2>
            <ul class="detail-list">
                <li>도시 코드: {{ city.id }}</li>
                <li>현재 상태: {{ city.status }}</li>
                <li>기온: {{ city.temp }}℃</li>
                <li>습도: {{ city.humidity }}%</li>
            </ul>
        </template>
        <p v-else>‘{{ route.params.cityId }}’ 에 해당하는 도시 정보를 찾을 수 없습니다.</p>
    </div>
</template>

<style scoped>
.detail-view {
    max-width: 560px;
    margin: 0 auto;
    padding: 1.5rem;
}

.back-link {
    display: inline-block;
    margin-bottom: 1rem;
    color: #42b883;
    text-decoration: none;
    font-weight: 600;
}

.detail-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.detail-list li {
    padding: 0.5rem 0;
    border-bottom: 1px solid #e2e5eb;
}
</style>
