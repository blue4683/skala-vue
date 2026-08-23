<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ArrowLeft, Location, Sunny, Opportunity, Cloudy } from '@element-plus/icons-vue'

const mockWeatherList = [
  { id: 'city_01', name: '서울', temp: 28, humidity: 65, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, humidity: 80, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, humidity: 70, status: '구름' },
  { id: 'city_04', name: '광주', temp: 24, humidity: 0, status: '맑음' },
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
    <div class="starfield" aria-hidden="true" />

    <RouterLink to="/dashboard" class="back-link"
      ><el-icon><ArrowLeft /></el-icon> 대시보드로 돌아가기</RouterLink
    >

    <template v-if="city">
      <section class="detail-hero">
        <div class="weather-symbol">
          <el-icon><component :is="weatherIcon" /></el-icon>
        </div>
        <div>
          <p>
            <el-icon><Location /></el-icon> {{ city.name }}
          </p>
          <h1>{{ city.status }} · {{ city.temp }}℃</h1>
          <span>오늘의 현재 기상 관측값</span>
        </div>
      </section>
      <section class="metrics-grid">
        <el-card shadow="never"
          ><el-icon><Sunny /></el-icon><span>현재 기온</span
          ><b>{{ city.temp }}<small>℃</small></b></el-card
        >
        <el-card shadow="never"
          ><el-icon><Opportunity /></el-icon><span>상대 습도</span
          ><b>{{ city.humidity }}<small>%</small></b></el-card
        >
        <el-card shadow="never"
          ><el-icon><Location /></el-icon><span>도시 코드</span
          ><b class="city-code">{{ city.id }}</b></el-card
        >
      </section>
    </template>

    <el-result
      v-else
      icon="warning"
      title="도시 정보를 찾을 수 없습니다"
      :sub-title="`‘${route.params.cityId}’에 해당하는 도시 정보가 없습니다.`"
    >
      <template #extra
        ><el-button type="primary" @click="$router.push('/dashboard')">대시보드로 이동</el-button></template
      >
    </el-result>
  </div>
</template>

<style scoped>
.detail-view {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  border-radius: 20px;
  color-scheme: dark;
  min-height: 480px;
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

.back-link {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  color: var(--sg-text-inverse-700);
  font-size: 0.85rem;
  text-decoration: none;
}

.back-link:hover {
  color: var(--sg-text-inverse-900);
}

.detail-hero {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 20px;
}

.weather-symbol {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--sg-bg-elevated);
  border: 1px solid var(--sg-border-dark);
  font-size: 2rem;
  color: #fbbf24;
}

.detail-hero p {
  margin: 0 0 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--sg-text-inverse-500);
  font-size: 0.85rem;
}

.detail-hero h1 {
  margin: 0 0 4px;
  font-size: clamp(1.5rem, 1rem + 2.5vw, 2.25rem);
  font-weight: 800;
  color: var(--sg-text-inverse-900);
}

.detail-hero span {
  color: var(--sg-text-inverse-500);
  font-size: 0.85rem;
}

.metrics-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 14px;
}

.metrics-grid :deep(.el-card) {
  background: var(--sg-bg-elevated);
  border-color: var(--sg-border-dark);
  border-radius: 14px;
}

.metrics-grid :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metrics-grid .el-icon {
  color: var(--sg-brand);
  font-size: 1.2rem;
}

.metrics-grid span {
  color: var(--sg-text-inverse-500);
  font-size: 0.82rem;
}

.metrics-grid b {
  font-size: 1.6rem;
  color: var(--sg-text-inverse-900);
}

.metrics-grid small {
  font-size: 1rem;
  color: var(--sg-text-inverse-500);
}

.city-code {
  font-size: 1.1rem !important;
  font-family: monospace;
}

:deep(.el-result) {
  position: relative;
  z-index: 1;
}

:deep(.el-result__title p) {
  color: var(--sg-text-inverse-900);
}

:deep(.el-result__subtitle p) {
  color: var(--sg-text-inverse-700);
}
</style>
