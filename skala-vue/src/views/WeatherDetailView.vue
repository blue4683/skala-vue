<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ArrowLeft, Location, Sunny, Opportunity, Cloudy } from '@element-plus/icons-vue'

const mockWeatherList = [
    { id: 'city_01', name: '서울', temp: 28, humidity: 65, status: '맑음'},
    { id: 'city_02', name: '수원', temp: 24, humidity: 80, status: '비'},
    { id: 'city_03', name: '부산', temp: 26, humidity: 70, status: '구름'},
    { id: 'city_04', name: '광주', temp: 24, humidity: 0, status: '맑음'},
]

const route = useRoute()
const city = ref(null)
const weatherIcon = computed(() => (city.value?.status === '비' ? Cloudy : Sunny))

onMounted(() => {
    city.value = mockWeatherList.find((c) => c.name === route.params.cityId) ?? null
})
</script>

<template>
  <div class="detail-view">
    <RouterLink to="/" class="back-link"><el-icon><ArrowLeft /></el-icon> 대시보드로 돌아가기</RouterLink>
    <template v-if="city">
      <section class="detail-hero">
        <div class="weather-symbol"><el-icon><component :is="weatherIcon" /></el-icon></div>
        <div><p><el-icon><Location /></el-icon> {{ city.name }}</p><h1>{{ city.status }} · {{ city.temp }}℃</h1><span>오늘의 현재 기상 관측값</span></div>
      </section>
      <section class="metrics-grid">
        <el-card shadow="never"><el-icon><Sunny /></el-icon><span>현재 기온</span><b>{{ city.temp }}<small>℃</small></b></el-card>
        <el-card shadow="never"><el-icon><Opportunity /></el-icon><span>상대 습도</span><b>{{ city.humidity }}<small>%</small></b></el-card>
        <el-card shadow="never"><el-icon><Location /></el-icon><span>도시 코드</span><b class="city-code">{{ city.id }}</b></el-card>
      </section>
    </template>
    <el-result v-else icon="warning" title="도시 정보를 찾을 수 없습니다" :sub-title="`‘${route.params.cityId}’에 해당하는 도시 정보가 없습니다.`">
      <template #extra><el-button type="primary" @click="$router.push('/')">대시보드로 이동</el-button></template>
    </el-result>
    </div>
</template>

<style scoped>
.detail-view { max-width: 780px; margin: 0 auto; }
.back-link { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 20px; color: #2875b7; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
.detail-hero { display: flex; align-items: center; gap: 22px; padding: 32px; border-radius: 22px; color: #fff; background: linear-gradient(120deg, #1f619e, #499bd5); }
.weather-symbol { display: grid; width: 78px; height: 78px; place-items: center; border-radius: 22px; color: #f7c957; background: rgba(255,255,255,.16); }
.weather-symbol :deep(.el-icon) { font-size: 2.9rem; }
.detail-hero p { display: flex; align-items: center; gap: 5px; color: #d9edff; font-size: .86rem; }
.detail-hero h1 { margin: 6px 0; font-size: 2rem; font-weight: 800; letter-spacing: -.05em; }
.detail-hero span { color: #e0f0fc; font-size: .9rem; }
.metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 16px; }
.metrics-grid :deep(.el-card) { border: 1px solid var(--color-border); border-radius: 16px; }
.metrics-grid :deep(.el-card__body) { display: flex; flex-direction: column; gap: 7px; padding: 20px; }
.metrics-grid :deep(.el-icon) { color: #3281c4; font-size: 1.25rem; }
.metrics-grid span { color: var(--color-muted); font-size: .8rem; }
.metrics-grid b { color: var(--color-heading); font-size: 1.65rem; font-weight: 800; letter-spacing: -.05em; }
.metrics-grid small { margin-left: 2px; color: var(--color-muted); font-size: .86rem; }
.metrics-grid .city-code { font-size: 1rem; letter-spacing: 0; }
@media (max-width: 560px) { .detail-hero { padding: 24px; } .metrics-grid { grid-template-columns: 1fr; } }
</style>
