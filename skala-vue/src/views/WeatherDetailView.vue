<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import {
  ArrowLeft,
  Cloudy,
  Compass,
  DataLine,
  Drizzling,
  Lightning,
  Location,
  MostlyCloudy,
  Odometer,
  PartlyCloudy,
  Pouring,
  Sunny,
  View,
  WindPower,
} from '@element-plus/icons-vue'
import { useConfigStore } from '@/stores/configStore'
import { useGlobalCityWeather } from '@/composables/useGlobalCityWeather'

const route = useRoute()
const configStore = useConfigStore()
const { loading, initialized, error, loadAll, cityById, weatherForCity } = useGlobalCityWeather()

const city = computed(() => cityById(String(route.params.cityId)))
const weather = computed(() => (city.value ? weatherForCity(city.value.id) : null))

const WEATHER_ICONS = {
  clear: Sunny,
  'partly-cloudy': PartlyCloudy,
  cloudy: Cloudy,
  fog: MostlyCloudy,
  drizzle: Drizzling,
  rain: Pouring,
  snow: MostlyCloudy,
  thunderstorm: Lightning,
  unknown: Cloudy,
}

const weatherIcon = computed(
  () => WEATHER_ICONS[weather.value?.conditionKey] ?? WEATHER_ICONS.unknown,
)

function temperatureLabel(celsius) {
  if (celsius == null) return '–'
  const value = configStore.unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius
  return `${value.toFixed(1)}${configStore.unitSymbol}`
}

function localTimeLabel(timestamp) {
  if (!timestamp || !city.value) return '기준 시각 확인 불가'
  return new Date(timestamp).toLocaleString('ko-KR', {
    timeZone: city.value.timezone,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function visibilityLabel(meters) {
  if (meters == null) return '–'
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`
}

function windDirectionLabel(degrees) {
  if (degrees == null) return '–'
  const directions = ['북', '북동', '동', '남동', '남', '남서', '서', '북서']
  return `${directions[Math.round(degrees / 45) % 8]} ${Math.round(degrees)}°`
}

onMounted(() => loadAll())
</script>

<template>
  <div class="detail-view">
    <div class="starfield" aria-hidden="true" />
    <div class="nebula" aria-hidden="true" />

    <nav class="detail-nav" aria-label="날씨 상세 이동">
      <RouterLink to="/dashboard" class="back-link">
        <el-icon><ArrowLeft /></el-icon> 대시보드로 돌아가기
      </RouterLink>
      <RouterLink to="/" class="map-link">별 관측 지도 보기</RouterLink>
    </nav>

    <template v-if="city">
      <section class="detail-hero">
        <div class="weather-symbol" aria-hidden="true">
          <el-icon><component :is="weatherIcon" /></el-icon>
        </div>
        <div>
          <p>
            <el-icon><Location /></el-icon> {{ city.region }}, {{ city.countryCode }}
          </p>
          <h1>
            {{ city.nameKo }}
            <span>{{ city.name }}</span>
          </h1>
          <template v-if="weather">
            <strong
              >{{ weather.conditionLabel }} · {{ temperatureLabel(weather.temperatureC) }}</strong
            >
            <small>{{ localTimeLabel(weather.observedAt) }} 기준 OpenWeather 현재 날씨</small>
          </template>
          <span v-else-if="loading" class="loading-copy">현재 날씨를 불러오는 중…</span>
        </div>
      </section>

      <el-skeleton
        v-if="(!initialized || loading) && !weather"
        class="detail-skeleton"
        :rows="6"
        animated
      />

      <el-result
        v-else-if="initialized && !weather"
        icon="warning"
        title="현재 날씨를 표시할 수 없습니다"
        :sub-title="error ?? '예보 범위에 해당하는 데이터가 없습니다.'"
      >
        <template #extra>
          <el-button type="primary" @click="loadAll({ force: true })">다시 불러오기</el-button>
        </template>
      </el-result>

      <template v-else>
        <section class="weather-sheet" aria-labelledby="current-weather-title">
          <header class="sheet-header">
            <div>
              <h2 id="current-weather-title">현재 날씨 상세</h2>
              <p>도시 좌표를 기준으로 조회한 OpenWeather 현재 날씨 데이터입니다.</p>
            </div>
            <span class="condition-label">{{ weather.conditionLabel }}</span>
          </header>

          <dl class="metrics-grid">
            <div class="metric">
              <el-icon><Sunny /></el-icon>
              <dt>현재 기온</dt>
              <dd>{{ temperatureLabel(weather.temperatureC) }}</dd>
            </div>
            <div class="metric">
              <el-icon><DataLine /></el-icon>
              <dt>체감 기온</dt>
              <dd>{{ temperatureLabel(weather.feelsLikeC) }}</dd>
            </div>
            <div class="metric">
              <el-icon><Odometer /></el-icon>
              <dt>상대 습도</dt>
              <dd>{{ weather.humidityPercent ?? '–' }}<small>%</small></dd>
            </div>
            <div class="metric">
              <el-icon><Cloudy /></el-icon>
              <dt>구름량</dt>
              <dd>{{ weather.cloudPercent ?? '–' }}<small>%</small></dd>
            </div>
            <div class="metric">
              <el-icon><WindPower /></el-icon>
              <dt>풍속</dt>
              <dd>{{ weather.windSpeedMps ?? '–' }}<small>m/s</small></dd>
            </div>
            <div class="metric">
              <el-icon><Compass /></el-icon>
              <dt>풍향</dt>
              <dd>{{ windDirectionLabel(weather.windDirectionDegrees) }}</dd>
            </div>
            <div class="metric">
              <el-icon><View /></el-icon>
              <dt>가시거리</dt>
              <dd>{{ visibilityLabel(weather.visibilityM) }}</dd>
            </div>
            <div class="metric">
              <el-icon><Pouring /></el-icon>
              <dt>시간 강수량</dt>
              <dd>{{ weather.precipitationMm ?? '–' }}<small>mm</small></dd>
            </div>
          </dl>

          <p class="pressure-note">
            해면 기압 {{ weather.pressureHpa != null ? Math.round(weather.pressureHpa) : '–' }} hPa
          </p>
        </section>

        <section class="location-context" aria-labelledby="location-title">
          <div>
            <h2 id="location-title">별 관측 도시 정보</h2>
            <p>{{ city.nearbyObservationArea }}</p>
          </div>
          <dl>
            <div>
              <dt>좌표</dt>
              <dd>{{ city.latitude.toFixed(4) }}, {{ city.longitude.toFixed(4) }}</dd>
            </div>
            <div>
              <dt>고도</dt>
              <dd>{{ city.elevationM.toLocaleString('ko-KR') }} m</dd>
            </div>
            <div>
              <dt>시간대</dt>
              <dd>{{ city.timezone }}</dd>
            </div>
          </dl>
        </section>
      </template>
    </template>

    <el-result
      v-else
      icon="warning"
      title="도시 정보를 찾을 수 없습니다"
      :sub-title="`‘${route.params.cityId}’에 해당하는 별 관측 도시가 없습니다.`"
    >
      <template #extra>
        <el-button type="primary" @click="$router.push('/dashboard')">대시보드로 이동</el-button>
      </template>
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
  min-height: 560px;
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
  right: -180px;
  bottom: -220px;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.28), transparent 70%);
  filter: blur(70px);
  pointer-events: none;
}

.detail-nav,
.detail-hero,
.weather-sheet,
.location-context,
.detail-skeleton,
:deep(.el-result) {
  position: relative;
  z-index: 1;
}

.detail-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.back-link,
.map-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--sg-text-inverse-700);
  font-size: 0.85rem;
  text-decoration: none;
}

.map-link {
  color: #93c5fd;
  font-weight: 700;
}

.back-link:hover,
.map-link:hover {
  color: var(--sg-text-inverse-900);
}

.back-link:focus-visible,
.map-link:focus-visible {
  border-radius: 4px;
  outline: 2px solid var(--sg-brand);
  outline-offset: 3px;
}

.detail-hero {
  display: flex;
  align-items: center;
  gap: 20px;
}

.weather-symbol {
  display: grid;
  place-items: center;
  width: 76px;
  height: 76px;
  flex: 0 0 76px;
  border: 1px solid var(--sg-border-dark);
  border-radius: 18px;
  background: var(--sg-bg-elevated);
  color: #fbbf24;
  font-size: 2.1rem;
}

.detail-hero p {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 4px;
  color: var(--sg-text-inverse-500);
  font-size: 0.82rem;
}

.detail-hero h1 {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 4px;
  color: var(--sg-text-inverse-900);
  font-size: clamp(1.6rem, 1.1rem + 2.5vw, 2.4rem);
  font-weight: 800;
  line-height: 1.2;
}

.detail-hero h1 span {
  color: var(--sg-text-inverse-500);
  font-size: 0.9rem;
  font-weight: 600;
}

.detail-hero strong {
  display: block;
  color: var(--sg-text-inverse-900);
  font-size: 1rem;
}

.detail-hero small,
.loading-copy {
  display: block;
  margin-top: 2px;
  color: var(--sg-text-inverse-500);
  font-size: 0.75rem;
}

.detail-skeleton {
  padding: 20px;
  border: 1px solid var(--sg-border-dark);
  border-radius: 16px;
  background: var(--sg-bg-elevated);
}

.weather-sheet {
  overflow: hidden;
  border: 1px solid var(--sg-border);
  border-radius: 16px;
  background: var(--sg-glass);
  color: var(--sg-ink-900);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.35);
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
  border-bottom: 1px solid var(--sg-border);
}

.sheet-header h2,
.location-context h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
}

.sheet-header p,
.location-context p {
  margin: 3px 0 0;
  color: var(--sg-ink-500);
  font-size: 0.78rem;
}

.condition-label {
  padding: 5px 11px;
  border-radius: 999px;
  background: var(--sg-brand-soft);
  color: var(--sg-brand-text);
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
}

.metric {
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: 2px 8px;
  padding: 16px 18px;
  border-right: 1px solid var(--sg-border);
  border-bottom: 1px solid var(--sg-border);
}

.metric:nth-child(4n) {
  border-right: none;
}

.metric:nth-last-child(-n + 4) {
  border-bottom: none;
}

.metric .el-icon {
  grid-row: 1 / span 2;
  align-self: center;
  color: var(--sg-brand);
  font-size: 1.2rem;
}

.metric dt {
  color: var(--sg-ink-500);
  font-size: 0.72rem;
}

.metric dd {
  margin: 0;
  color: var(--sg-ink-900);
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.25;
}

.metric dd small {
  margin-left: 2px;
  color: var(--sg-ink-500);
  font-size: 0.72rem;
}

.pressure-note {
  margin: 0;
  padding: 10px 18px;
  border-top: 1px solid var(--sg-border);
  color: var(--sg-ink-500);
  font-size: 0.72rem;
  text-align: right;
}

.location-context {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) 2fr;
  gap: 20px;
  padding: 18px;
  border: 1px solid var(--sg-border-dark);
  border-radius: 16px;
  background: var(--sg-bg-elevated);
  color: var(--sg-text-inverse-900);
}

.location-context p {
  color: var(--sg-text-inverse-500);
}

.location-context dl {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin: 0;
}

.location-context dt {
  color: var(--sg-text-inverse-500);
  font-size: 0.72rem;
}

.location-context dd {
  margin: 4px 0 0;
  overflow-wrap: anywhere;
  color: var(--sg-text-inverse-900);
  font-size: 0.82rem;
  font-weight: 700;
}

:deep(.el-result__title p) {
  color: var(--sg-text-inverse-900);
}

:deep(.el-result__subtitle p) {
  color: var(--sg-text-inverse-700);
}

@media (max-width: 860px) {
  .metrics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .metric:nth-child(4n) {
    border-right: 1px solid var(--sg-border);
  }

  .metric:nth-child(2n) {
    border-right: none;
  }

  .metric:nth-last-child(-n + 4) {
    border-bottom: 1px solid var(--sg-border);
  }

  .metric:nth-last-child(-n + 2) {
    border-bottom: none;
  }

  .location-context {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .detail-view {
    padding: 16px;
  }

  .detail-nav {
    align-items: flex-start;
    flex-direction: column;
  }

  .detail-hero {
    align-items: flex-start;
  }

  .weather-symbol {
    width: 60px;
    height: 60px;
    flex-basis: 60px;
    border-radius: 14px;
    font-size: 1.7rem;
  }

  .sheet-header {
    align-items: flex-start;
  }

  .metrics-grid,
  .location-context dl {
    grid-template-columns: 1fr;
  }

  .metric,
  .metric:nth-child(2n),
  .metric:nth-child(4n),
  .metric:nth-last-child(-n + 2),
  .metric:nth-last-child(-n + 4) {
    border-right: none;
    border-bottom: 1px solid var(--sg-border);
  }

  .metric:last-child {
    border-bottom: none;
  }
}
</style>
