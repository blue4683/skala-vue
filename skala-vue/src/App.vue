<script setup>
import { RouterLink, RouterView } from 'vue-router'

</script>

<template>
  <header class="app-header">
    <nav class="view-nav">
      <RouterLink to="/">날씨 대시보드</RouterLink>
      <RouterLink to="/about">서비스 소개</RouterLink>
    </nav>
  </header>

  <main class="router-content">
    <RouterView />
  </main>
</template>

<style scoped>
.app-header {
  background-color: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);
}

.view-nav {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
}

.view-nav a {
  text-decoration: none;
  color: var(--color-text);
  font-weight: 500;
  padding: 0.25rem 0;
}

.view-nav a.router-link-exact-active {
  font-weight: 700;
  color: #42b883;
  border-bottom: 2px solid #42b883;
}

.router-content {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
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
</style>
