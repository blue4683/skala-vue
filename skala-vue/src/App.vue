<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import UnitToggler from './components/exercise/UnitToggler.vue'

const route = useRoute()
</script>

<template>
  <header :class="{ 'is-dark': route.path === '/' }">
    <nav aria-label="주요 메뉴">
      <RouterLink to="/">별 관측 지도</RouterLink>
      <RouterLink to="/dashboard">날씨 대시보드</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav>
    <UnitToggler v-if="route.path === '/dashboard' || route.name === 'weather-detail'" />
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--sg-border);
  background: var(--sg-surface);
  overflow-x: auto;
  transition:
    background-color 0.2s,
    border-color 0.2s;
}

header.is-dark {
  background: var(--sg-bg-elevated);
  border-bottom-color: var(--sg-border-dark);
}

nav {
  display: flex;
  gap: 4px;
}

nav a {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--sg-ink-700);
  white-space: nowrap;
  text-decoration: none;
  transition:
    background-color 0.15s,
    color 0.15s;
}

nav a:hover {
  color: var(--sg-brand-text);
  background: var(--sg-brand-soft);
}

nav a:focus-visible {
  outline: 2px solid var(--sg-brand);
  outline-offset: 2px;
}

nav a.router-link-exact-active {
  color: var(--sg-brand-text);
  background: var(--sg-brand-soft);
}

header.is-dark nav a {
  color: var(--sg-text-inverse-700);
}

header.is-dark nav a:hover {
  color: var(--sg-text-inverse-900);
  background: var(--sg-bg-elevated-2);
}

header.is-dark nav a.router-link-exact-active {
  color: var(--sg-text-inverse-900);
  background: var(--sg-brand);
}

@media (max-width: 640px) {
  header {
    padding: 10px 14px;
  }
}
</style>
