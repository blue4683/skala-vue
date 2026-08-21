<script setup>
import {ref, onMounted, onUpdated, onUnmounted} from 'vue'

const count = ref(0)
let timerId = null

console.log('1. [setup] 컴포넌트가 메모리에 생성되었습니다. (DOM 접근 불가능)')

onMounted(() => {
    console.log('2. [onMounted] 화면에 완벽히 부착되었습니다! (API 호출/DOM 조작 적기)')
    timerId = setInterval(() => {
        count.value++
    }, 3000)
})

onUpdated(() => {
    console.log(`3. [onUpdated] 데이터가 변경되어 화면을 새로 그렸습니다. (현재 count: ${count.value})`)
})

onUnmounted(() => {
    clearInterval(timerId)
    console.log('4. [onUnmounted] 컴포넌트가 소멸했습니다. 타이머 청소 완료!')
})
</script>

<template>
    <div class="practice-section">
        <h2>Lifecycle Hook</h2>

        <div class="destroy-box">
            <span class="dot">●</span> 실습 컴포넌트 파괴하기 (v-if="false")
        </div>

        <hr class="divider" />

        <h3>⏱️ 라이프사이클 훅 흐름 탐색기</h3>
        <div class="monitor">
            <p>실시간 타이머 카운트: {{ count }}</p>
            <button @click="count++">수동으로 숫자 올리기</button>
        </div>
    </div>
</template>

<style scoped>
.practice-section {
    max-width: 480px;
    margin: 0 auto;
    padding: 1rem 1.25rem;
}

.destroy-box {
    margin: 0.75rem 0;
    padding: 0.75rem 1rem;
    background-color: #f2f2f4;
    border-radius: 8px;
    text-align: center;
    font-weight: 600;
    color: #333;
}

.dot {
    color: #b23b3b;
}

.divider {
    border: none;
    height: 3px;
    margin: 1rem 0;
    background: linear-gradient(to right, #1f2430, #3a6b6b);
}

.monitor {
    margin-top: 0.75rem;
    padding: 1rem;
    background-color: #eaf6f8;
    border: 1px solid #cfe8ec;
    border-radius: 8px;
    text-align: center;
}

.monitor p {
    margin: 0 0 0.75rem;
    color: #333;
}

.monitor button {
    padding: 0.5rem 1rem;
    border: 1px solid #cfd4de;
    border-radius: 6px;
    background-color: #fff;
    cursor: pointer;
}
</style>