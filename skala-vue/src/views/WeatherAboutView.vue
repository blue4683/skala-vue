<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
    <div class="about-view">
        <h2>☁️ Weather Dashboard 소개</h2>
        <p>
            Weather Dashboard는 도시를 검색하고 지역별 기온·습도·불쾌지수를 한눈에
            확인할 수 있는 날씨 실습용 애플리케이션입니다.
        </p>
        <p>
            카드를 클릭하면 하단 상태바에서 선택한 도시의 상세 지표를 확인할 수 있고,
            "상세보기" 버튼을 누르면 해당 도시의 상세 기상관측 페이지로 이동합니다.
        </p>
        <RouterLink to="/" class="back-link">← 메인 대시보드로 돌아가기</RouterLink>
    </div>
</template>

<style scoped>
.about-view {
    max-width: 560px;
    margin: 0 auto;
    padding: 1.5rem;
}

.about-view p {
    color: #4a5062;
    line-height: 1.6;
}

.back-link {
    display: inline-block;
    margin-top: 1rem;
    color: #42b883;
    text-decoration: none;
    font-weight: 600;
}
</style>
