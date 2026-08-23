<script setup>
import { RouterLink } from 'vue-router'
import { Cloudy, Compass, DataAnalysis } from '@element-plus/icons-vue'
</script>

<template>
  <div class="about-view">
    <section class="about-hero"><el-icon><Cloudy /></el-icon><p>weatherly</p><h1>날씨를 더 선명하게,<br>일상을 더 가볍게.</h1><span>필요한 날씨 정보를 직관적으로 보여주는 날씨 대시보드입니다.</span></section>
    <section class="feature-grid">
      <el-card shadow="never"><el-icon><Compass /></el-icon><h2>도시별 탐색</h2><p>원하는 도시의 현재 날씨를 빠르게 찾아보세요.</p></el-card>
      <el-card shadow="never"><el-icon><DataAnalysis /></el-icon><h2>한눈에 보는 지표</h2><p>기온, 습도, 불쾌지수를 깔끔하게 비교합니다.</p></el-card>
    </section>
    <RouterLink to="/"><el-button type="primary" size="large">대시보드 둘러보기</el-button></RouterLink>
    </div>
</template>

<style scoped>
.about-view { max-width: 780px; margin: 0 auto; }
.about-hero { padding: 46px; border-radius: 24px; color: #fff; background: linear-gradient(140deg, #173e70, #317ebc); }
.about-hero :deep(.el-icon) { color: #f6c954; font-size: 2.2rem; }
.about-hero p { margin-top: 18px; color: #bcdcf4; font-size: .85rem; font-weight: 700; }
.about-hero h1 { margin: 8px 0 16px; font-size: clamp(1.8rem, 4vw, 2.5rem); font-weight: 800; line-height: 1.25; letter-spacing: -.06em; }
.about-hero span { color: #d7eafa; font-size: .93rem; }
.feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 18px 0 24px; }
.feature-grid :deep(.el-card) { border: 1px solid var(--color-border); border-radius: 18px; }
.feature-grid :deep(.el-card__body) { padding: 23px; }
.feature-grid :deep(.el-icon) { color: #2e81c4; font-size: 1.5rem; }
.feature-grid h2 { margin: 12px 0 6px; color: var(--color-heading); font-size: 1rem; font-weight: 750; }
.feature-grid p { color: var(--color-muted); font-size: .87rem; line-height: 1.6; }
.about-view > a { text-decoration: none; }
@media (max-width: 560px) { .about-hero { padding: 30px; } .feature-grid { grid-template-columns: 1fr; } }
</style>
