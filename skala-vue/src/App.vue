<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import UnitToggler from './components/exercise/UnitToggler.vue'

const route = useRoute()
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <RouterLink to="/" class="brand" aria-label="Weatherly 홈">
        <span class="brand-mark">W</span>
        <span>weatherly</span>
      </RouterLink>
      <nav class="view-nav" aria-label="주요 메뉴">
        <RouterLink to="/">해안 지도</RouterLink>
        <RouterLink to="/dashboard">대시보드</RouterLink>
        <RouterLink to="/scene">날씨 장면</RouterLink>
        <RouterLink to="/about">서비스 소개</RouterLink>
      </nav>
      <div class="header-action">
        <UnitToggler v-if="route.path === '/dashboard'" />
      </div>
    </div>
  </header>

  <main class="router-content">
    <RouterView />
  </main>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.88);
  border-bottom: 1px solid rgba(220, 230, 242, 0.9);
  backdrop-filter: blur(16px);
}

.header-inner {
  max-width: 1180px;
  min-height: 68px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  padding: 0 24px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--color-heading);
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 10px;
  color: #fff;
  background: linear-gradient(145deg, #3d93e6, #1e5eae);
  box-shadow: 0 5px 12px rgba(37, 117, 196, 0.25);
  font-size: 0.92rem;
}

.view-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 52px;
}

.view-nav a {
  text-decoration: none;
  color: var(--color-muted);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 8px;
}

.view-nav a.router-link-exact-active {
  color: #1e639f;
  background: #eaf4fd;
}

.header-action {
  margin-left: auto;
}

.router-content {
  max-width: 1180px;
  margin: 0 auto;
  padding: 44px 24px 64px;
}

.practice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  align-items: start;
}

.practice-grid .practice-section {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.25rem;
  background-color: var(--color-background-soft);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@media (max-width: 680px) {
  .header-inner { min-height: 60px; padding: 0 16px; }
  .brand { font-size: 1rem; }
  .view-nav { gap: 0; margin-left: 18px; }
  .view-nav a { padding: 8px; font-size: 0.8rem; }
  .router-content { padding: 28px 16px 48px; }
}
</style>
