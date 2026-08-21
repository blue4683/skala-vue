<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
    <div class="not-found-view">
        <h2>404</h2>
        <p>요청하신 페이지를 찾을 수 없습니다.</p>
        <RouterLink to="/" class="back-link">← 메인 대시보드로 돌아가기</RouterLink>
    </div>
</template>

<style scoped>
.not-found-view {
    max-width: 560px;
    margin: 0 auto;
    padding: 3rem 1.5rem;
    text-align: center;
}

.not-found-view h2 {
    font-size: 2.5rem;
    margin: 0 0 0.5rem;
}

.back-link {
    display: inline-block;
    margin-top: 1rem;
    color: #42b883;
    text-decoration: none;
    font-weight: 600;
}
</style>
