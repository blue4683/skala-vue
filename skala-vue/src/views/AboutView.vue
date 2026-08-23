<template>
  <div class="about">
    <div class="starfield" aria-hidden="true" />
    <div class="nebula nebula-warm" aria-hidden="true" />
    <div class="nebula nebula-cool" aria-hidden="true" />

    <section class="about-content" aria-labelledby="about-title">
      <h1 id="about-title">별을 보기 좋은 밤을<br /><em>더 쉽게 찾으세요.</em></h1>
      <div class="about-copy">
        <p>
          별 관측 지도는 전 세계 관측 후보 도시의 구름과 광공해, 관측 추천 점수를 한눈에 비교할 수
          있는 서비스입니다.
        </p>
        <p>
          관심 도시를 선택하면 현재 날씨와 관측 가능한 별자리 정보를 확인하고, 날씨 대시보드에서
          도시별 관측 조건을 자세히 살펴볼 수 있습니다.
        </p>
      </div>
    </section>

    <div class="sky-chart" aria-hidden="true">
      <svg viewBox="0 0 480 480" focusable="false">
        <circle class="chart-orbit orbit-outer" cx="240" cy="240" r="190" />
        <circle class="chart-orbit orbit-inner" cx="240" cy="240" r="118" />
        <path class="chart-arc" d="M72 310C126 156 272 72 406 174" />
        <path
          class="constellation-line"
          d="M108 282L174 222L226 250L278 162L336 198L382 126M226 250L304 310L356 278"
        />
        <g class="chart-stars">
          <circle cx="108" cy="282" r="5" />
          <circle cx="174" cy="222" r="8" />
          <circle cx="226" cy="250" r="4" />
          <circle cx="278" cy="162" r="6" />
          <circle cx="336" cy="198" r="4" />
          <circle cx="382" cy="126" r="7" />
          <circle cx="304" cy="310" r="6" />
          <circle cx="356" cy="278" r="4" />
        </g>
        <g class="field-stars">
          <circle cx="102" cy="146" r="2" />
          <circle cx="156" cy="350" r="2.5" />
          <circle cx="244" cy="96" r="2" />
          <circle cx="396" cy="246" r="2.5" />
          <circle cx="268" cy="382" r="2" />
          <circle cx="414" cy="346" r="1.5" />
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.about {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
  align-items: center;
  gap: clamp(32px, 6vw, 80px);
  min-height: clamp(520px, calc(100svh - 121px), 720px);
  padding: clamp(32px, 6vw, 72px);
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
  width: 520px;
  height: 520px;
  border-radius: 50%;
  filter: blur(70px);
  pointer-events: none;
}

.nebula-warm {
  top: -260px;
  left: -160px;
  background: radial-gradient(circle, rgba(217, 119, 6, 0.3), transparent 70%);
}

.nebula-cool {
  right: -220px;
  bottom: -280px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.26), transparent 70%);
}

.about-content {
  position: relative;
  z-index: 1;
  max-width: 60ch;
}

.about h1 {
  max-width: 20ch;
  margin: 0 0 24px;
  color: var(--sg-text-inverse-900);
  font-size: clamp(1.75rem, 1.1rem + 3vw, 2.75rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.01em;
  text-wrap: balance;
}

.about h1 em {
  color: var(--sg-brand);
  font-style: normal;
  font-weight: inherit;
}

.about-copy {
  max-width: 60ch;
  padding-inline-start: 20px;
  border-inline-start: 1px solid var(--sg-border-dark);
}

.about p {
  margin: 0;
  color: var(--sg-text-inverse-700);
  font-size: clamp(1rem, 0.96rem + 0.16vw, 1.06rem);
  line-height: 1.75;
}

.about p + p {
  margin-top: 12px;
}

.sky-chart {
  position: relative;
  z-index: 1;
  width: min(100%, 420px);
  aspect-ratio: 1;
  justify-self: end;
}

.sky-chart svg {
  display: block;
  width: 100%;
  height: 100%;
}

.chart-orbit,
.chart-arc,
.constellation-line {
  fill: none;
  vector-effect: non-scaling-stroke;
}

.chart-orbit {
  stroke: var(--sg-border-dark);
  stroke-width: 1;
  stroke-dasharray: 4 12;
}

.orbit-inner {
  stroke-dasharray: 2 10;
}

.chart-arc {
  stroke: rgba(185, 196, 214, 0.2);
  stroke-width: 1;
}

.constellation-line {
  stroke: rgba(185, 196, 214, 0.58);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chart-stars circle {
  fill: var(--sg-text-inverse-900);
  stroke: rgba(255, 255, 255, 0.22);
  stroke-width: 8;
}

.field-stars circle {
  fill: var(--sg-text-inverse-500);
}

.about ::selection {
  color: var(--sg-text-inverse-900);
  background: var(--sg-brand);
}

@media (max-width: 860px) {
  .about {
    grid-template-columns: 1fr;
    gap: 24px;
    min-height: auto;
    padding: 40px 28px 28px;
  }

  .about-content {
    max-width: none;
  }

  .sky-chart {
    width: min(78vw, 280px);
    justify-self: center;
  }
}

@media (max-width: 420px) {
  .about {
    padding: 32px 20px 24px;
    border-radius: 16px;
  }

  .about-copy {
    padding-inline-start: 16px;
  }
}
</style>
