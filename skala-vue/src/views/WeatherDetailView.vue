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
    <RouterLink to="/" class="back-link"
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
        ><el-button type="primary" @click="$router.push('/')">대시보드로 이동</el-button></template
      >
    </el-result>
  </div>
</template>

<style scoped></style>
