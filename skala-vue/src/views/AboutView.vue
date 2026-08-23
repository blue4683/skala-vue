<template>
  <div class="about">
    <div class="starfield" aria-hidden="true" />
    <section class="about-content" aria-labelledby="about-title">
      <h1 id="about-title">별을 보기 좋은 밤을 더 쉽게 찾으세요.</h1>
      <p>
        별 관측 지도는 전 세계 관측 후보 도시의 구름과 광공해, 관측 추천 점수를 한눈에 비교할 수
        있는 서비스입니다.
      </p>
      <p>
        관심 도시를 선택하면 현재 날씨와 관측 가능한 별자리 정보를 확인하고, 날씨 대시보드에서
        도시별 관측 조건을 자세히 살펴볼 수 있습니다.
      </p>
    </section>
  </div>
</template>

<style scoped>
.about {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: 320px;
  padding: 24px;
  border-radius: 20px;
  display: flex;
  align-items: center;
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
    radial-gradient(1px 1px at 60px 120px, var(--sg-star), transparent 100%);
  background-size: 200px 200px;
  background-repeat: repeat;
}

.about-content {
  position: relative;
  z-index: 1;
  max-width: 68ch;
}

.about h1 {
  max-width: 18ch;
  margin: 0 0 24px;
  color: var(--sg-text-inverse-900);
  font-size: clamp(2rem, 6vw, 4rem);
  line-height: 1.08;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.about p {
  max-width: 65ch;
  margin: 0;
  color: var(--sg-text-inverse-700);
  font-size: 1rem;
  line-height: 1.75;
}

.about p + p {
  margin-top: 12px;
}

@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
  }
}
</style>
