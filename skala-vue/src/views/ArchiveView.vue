<script setup>
import { computed, ref } from 'vue'

import PropsEmitsParent from '@archive/components/PropsEmitsParent.vue'
import SampleEight from '@archive/components/SampleEight.vue'
import SampleEighteen from '@archive/components/SampleEighteen.vue'
import SampleEleven from '@archive/components/SampleEleven.vue'
import SampleFifthteen from '@archive/components/SampleFifthteen.vue'
import SampleFive from '@archive/components/SampleFive.vue'
import SampleFour from '@archive/components/SampleFour.vue'
import SampleFourteen from '@archive/components/SampleFourteen.vue'
import SampleNine from '@archive/components/SampleNine.vue'
import SampleNineteen from '@archive/components/SampleNineteen.vue'
import SampleSeven from '@archive/components/SampleSeven.vue'
import SampleSeventeen from '@archive/components/SampleSeventeen.vue'
import SampleSix from '@archive/components/SampleSix.vue'
import SampleSixteen from '@archive/components/SampleSixteen.vue'
import SampleTen from '@archive/components/SampleTen.vue'
import SampleThirteen from '@archive/components/SampleThirteen.vue'
import SampleThree from '@archive/components/SampleThree.vue'
import SampleTwelve from '@archive/components/SampleTwelve.vue'
import SampleTwenty from '@archive/components/SampleTwenty.vue'
import SampleTwentyFive from '@archive/components/SampleTwentyFive.vue'
import SampleTwentyFour from '@archive/components/SampleTwentyFour.vue'
import SampleTwentyOne from '@archive/components/SampleTwentyOne.vue'
import SampleTwentyThree from '@archive/components/SampleTwentyThree.vue'
import SampleTwentyTwo from '@archive/components/SampleTwentyTwo.vue'
import SampleTwo from '@archive/components/SampleTwo.vue'
import SampleView from '@archive/components/SampleView.vue'
import SlotDefaultParent from '@archive/components/SlotDefaultParent.vue'
import SlotNamedParent from '@archive/components/SlotNamedParent.vue'
import SlotScopedParent from '@archive/components/SlotScopedParent.vue'
import StoreCounter from '@archive/components/practices/library/StoreCounter.vue'

const groups = [
  {
    id: 'directives',
    label: '템플릿과 디렉티브',
    description: '출력, 바인딩, 조건, 반복, 이벤트와 폼 입력의 기본 동작을 직접 확인합니다.',
    practices: [
      { file: 'SampleView.vue', component: SampleView },
      { file: 'SampleTwo.vue', component: SampleTwo },
      { file: 'SampleThree.vue', component: SampleThree },
      { file: 'SampleFour.vue', component: SampleFour },
      { file: 'SampleFive.vue', component: SampleFive },
      { file: 'SampleSix.vue', component: SampleSix },
      { file: 'SampleSeven.vue', component: SampleSeven },
      { file: 'SampleEight.vue', component: SampleEight },
      { file: 'SampleNine.vue', component: SampleNine },
      { file: 'SampleTen.vue', component: SampleTen },
      { file: 'SampleEleven.vue', component: SampleEleven },
      { file: 'SampleTwelve.vue', component: SampleTwelve },
      { file: 'SampleThirteen.vue', component: SampleThirteen },
      { file: 'SampleFourteen.vue', component: SampleFourteen },
      { file: 'SampleFifthteen.vue', component: SampleFifthteen },
      { file: 'SampleSixteen.vue', component: SampleSixteen },
      { file: 'SampleSeventeen.vue', component: SampleSeventeen },
    ],
  },
  {
    id: 'reactivity',
    label: '반응성과 생명주기',
    description: 'ref, reactive, computed, watch 계열과 컴포넌트 생명주기의 차이를 비교합니다.',
    practices: [
      { file: 'SampleEighteen.vue', component: SampleEighteen },
      { file: 'SampleNineteen.vue', component: SampleNineteen },
      { file: 'SampleTwenty.vue', component: SampleTwenty },
      { file: 'SampleTwentyOne.vue', component: SampleTwentyOne },
      { file: 'SampleTwentyTwo.vue', component: SampleTwentyTwo },
      { file: 'SampleTwentyThree.vue', component: SampleTwentyThree },
      { file: 'SampleTwentyFour.vue', component: SampleTwentyFour },
      { file: 'SampleTwentyFive.vue', component: SampleTwentyFive },
    ],
  },
  {
    id: 'communication',
    label: '컴포넌트 통신',
    description: 'Props, Emits와 기본·이름·범위 슬롯을 Parent–Child 예제로 탐색합니다.',
    practices: [
      { file: 'PropsEmitsParent.vue', component: PropsEmitsParent },
      { file: 'SlotDefaultParent.vue', component: SlotDefaultParent },
      { file: 'SlotNamedParent.vue', component: SlotNamedParent },
      { file: 'SlotScopedParent.vue', component: SlotScopedParent },
    ],
  },
  {
    id: 'store',
    label: '상태 관리',
    description: 'Pinia Store의 state, getter와 action이 한 흐름으로 갱신되는 과정을 확인합니다.',
    practices: [{ file: 'StoreCounter.vue', component: StoreCounter }],
  },
]

const activeGroup = ref('all')
const totalCount = groups.reduce((sum, group) => sum + group.practices.length, 0)
const visibleGroups = computed(() =>
  activeGroup.value === 'all' ? groups : groups.filter((group) => group.id === activeGroup.value),
)
</script>

<template>
  <div class="archive-view">
    <!--
      THESIS: 완성된 결과 뒤에 남은 Vue 학습 과정을 숨기지 않고, 직접 조작하는 작업대로 보여준다.
      OWN-WORLD: 기존 밤하늘 무대 위에 정보 밀도용 밝은 패널과 브랜드 블루 선택 상태를 사용한다.
      STORY: 방문자는 주제를 고르고 원본 archive 컴포넌트를 조작하며 Vue 개념의 차이를 확인한다.
      FIRST VIEWPORT: 설명과 전체 실습 수, 고정 필터가 먼저 보이고 아래에서 원본 실습 카드가 시작된다.
      FORM: 기존 디자인 시스템을 확장한 Operate 모드의 필터형 실습 카탈로그.
      FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
    -->
    <div class="starfield" aria-hidden="true" />
    <div class="nebula" aria-hidden="true" />

    <section class="archive-intro" aria-labelledby="archive-title">
      <div>
        <h1 id="archive-title">Vue 실습을<br /><em>직접 다시 실행해 보세요.</em></h1>
        <p>
          archive에 보관한 학습 컴포넌트를 현재 앱 안에서 그대로 렌더링합니다. 버튼과 입력을
          조작하며 각 예제의 반응을 비교할 수 있습니다.
        </p>
      </div>
      <dl class="archive-summary" aria-label="아카이브 요약">
        <div>
          <dt>실행 가능한 예제</dt>
          <dd>{{ totalCount }}개</dd>
        </div>
        <div>
          <dt>학습 주제</dt>
          <dd>{{ groups.length }}개</dd>
        </div>
      </dl>
    </section>

    <nav class="archive-filter" aria-label="실습 주제 필터">
      <button
        type="button"
        :aria-pressed="activeGroup === 'all'"
        :class="{ 'is-active': activeGroup === 'all' }"
        @click="activeGroup = 'all'"
      >
        전체 <span>{{ totalCount }}</span>
      </button>
      <button
        v-for="group in groups"
        :key="group.id"
        type="button"
        :aria-pressed="activeGroup === group.id"
        :class="{ 'is-active': activeGroup === group.id }"
        @click="activeGroup = group.id"
      >
        {{ group.label }} <span>{{ group.practices.length }}</span>
      </button>
    </nav>

    <div class="archive-groups">
      <section
        v-for="group in visibleGroups"
        :key="group.id"
        class="practice-group"
        :aria-labelledby="`${group.id}-title`"
      >
        <header class="group-heading">
          <div>
            <h2 :id="`${group.id}-title`">{{ group.label }}</h2>
            <p>{{ group.description }}</p>
          </div>
          <span>{{ group.practices.length }}개 예제</span>
        </header>

        <div class="practice-grid">
          <article
            v-for="practice in group.practices"
            :key="practice.file"
            class="practice-card"
            :aria-label="`${practice.file} 실습`"
          >
            <div class="practice-file">
              <code>{{ practice.file }}</code>
            </div>
            <div class="practice-preview">
              <component :is="practice.component" />
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.archive-view {
  position: relative;
  isolation: isolate;
  overflow: clip;
  min-height: calc(100svh - 121px);
  padding: clamp(24px, 4vw, 48px);
  border-radius: 20px;
  color-scheme: dark;
}

.archive-view > :not(.starfield, .nebula) {
  position: relative;
  z-index: 1;
}

.starfield {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-color: var(--sg-bg);
  background-image:
    radial-gradient(1.4px 1.4px at 20px 30px, var(--sg-star), transparent 100%),
    radial-gradient(1px 1px at 90px 80px, var(--sg-star), transparent 100%),
    radial-gradient(1.6px 1.6px at 150px 40px, var(--sg-star), transparent 100%),
    radial-gradient(1px 1px at 60px 120px, var(--sg-star), transparent 100%),
    radial-gradient(1.2px 1.2px at 180px 150px, var(--sg-star), transparent 100%);
  background-size: 200px 200px;
}

.nebula {
  position: absolute;
  top: -240px;
  right: -180px;
  z-index: 0;
  width: 560px;
  height: 560px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.3), transparent 70%);
  filter: blur(70px);
  pointer-events: none;
}

.archive-intro {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: clamp(28px, 6vw, 80px);
  margin-bottom: 30px;
}

.archive-intro h1 {
  max-width: 20ch;
  margin: 0 0 18px;
  color: var(--sg-text-inverse-900);
  font-size: clamp(1.75rem, 1.1rem + 3vw, 2.75rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.01em;
  text-wrap: balance;
}

.archive-intro h1 em {
  color: var(--sg-brand);
  font-style: normal;
  font-weight: inherit;
}

.archive-intro p {
  max-width: 68ch;
  margin: 0;
  color: var(--sg-text-inverse-700);
  font-size: 0.98rem;
  line-height: 1.75;
}

.archive-summary {
  display: flex;
  gap: 10px;
  margin: 0;
}

.archive-summary div {
  min-width: 126px;
  padding: 14px 16px;
  border: 1px solid var(--sg-border-dark);
  border-radius: 16px;
  background: var(--sg-bg-elevated);
}

.archive-summary dt {
  color: var(--sg-text-inverse-500);
  font-size: 0.76rem;
  font-weight: 600;
}

.archive-summary dd {
  margin: 2px 0 0;
  color: var(--sg-text-inverse-900);
  font-size: 1.35rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.archive-filter {
  position: sticky;
  top: 12px;
  z-index: 3;
  display: flex;
  gap: 6px;
  width: fit-content;
  max-width: 100%;
  margin-bottom: 38px;
  padding: 5px;
  overflow-x: auto;
  border: 1px solid var(--sg-border-dark);
  border-radius: 999px;
  background: rgba(19, 28, 48, 0.92);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(14px);
  scrollbar-width: none;
}

.archive-filter::-webkit-scrollbar {
  display: none;
}

.archive-filter button {
  flex: 0 0 auto;
  padding: 8px 13px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--sg-text-inverse-700);
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.archive-filter button span {
  margin-inline-start: 4px;
  color: var(--sg-text-inverse-500);
  font-variant-numeric: tabular-nums;
}

.archive-filter button:hover {
  color: var(--sg-text-inverse-900);
  background: var(--sg-bg-elevated-2);
}

.archive-filter button.is-active {
  color: #fff;
  background: var(--sg-brand);
}

.archive-filter button.is-active span {
  color: rgba(255, 255, 255, 0.78);
}

.archive-filter button:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.archive-groups {
  display: flex;
  flex-direction: column;
  gap: 56px;
}

.group-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 18px;
}

.group-heading h2 {
  margin: 0 0 5px;
  color: var(--sg-text-inverse-900);
  font-size: clamp(1.35rem, 1.1rem + 0.8vw, 1.75rem);
  font-weight: 800;
}

.group-heading p {
  max-width: 68ch;
  margin: 0;
  color: var(--sg-text-inverse-700);
  font-size: 0.9rem;
}

.group-heading > span {
  flex: 0 0 auto;
  color: var(--sg-text-inverse-500);
  font-size: 0.8rem;
  font-weight: 700;
}

.practice-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}

.practice-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--sg-border);
  border-radius: 16px;
  background: var(--sg-glass);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25);
  color-scheme: light;
}

.practice-file {
  padding: 9px 14px;
  border-bottom: 1px solid var(--sg-border);
  background: rgba(219, 234, 254, 0.55);
}

.practice-file code {
  color: var(--sg-brand-text);
  font-size: 0.76rem;
  font-weight: 700;
}

.practice-preview {
  min-width: 0;
  padding: 18px;
  color: var(--sg-ink-700);
}

.practice-preview :deep(.practice-section) {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
  color: var(--sg-ink-700);
  background: transparent;
  box-shadow: none;
}

.practice-preview :deep(h2) {
  margin: 0 0 14px;
  color: var(--sg-ink-900);
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.35;
}

.practice-preview :deep(h3) {
  margin: 18px 0 7px;
  color: var(--sg-ink-700);
  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.45;
}

.practice-preview :deep(p) {
  margin: 8px 0;
  overflow-wrap: anywhere;
}

.practice-preview :deep(ul) {
  margin: 8px 0;
  padding-inline-start: 22px;
}

.practice-preview :deep(button) {
  min-height: 36px;
  margin: 3px 3px 3px 0;
  padding: 7px 11px;
  border: 1px solid var(--sg-border);
  border-radius: 999px;
  background: var(--sg-brand-soft);
  color: var(--sg-brand-text);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.practice-preview :deep(button:hover:not(:disabled)) {
  border-color: var(--sg-brand);
  background: #c7ddff;
}

.practice-preview :deep(button:disabled) {
  color: var(--sg-ink-500);
  background: var(--sg-neutral-soft);
  cursor: not-allowed;
  opacity: 0.75;
}

.practice-preview :deep(button:focus-visible),
.practice-preview :deep(input:focus-visible),
.practice-preview :deep(textarea:focus-visible),
.practice-preview :deep(select:focus-visible),
.practice-preview :deep(a:focus-visible) {
  outline: 2px solid var(--sg-brand);
  outline-offset: 2px;
}

.practice-preview :deep(input:not([type='checkbox'], [type='radio'])),
.practice-preview :deep(textarea),
.practice-preview :deep(select) {
  max-width: 100%;
  min-height: 36px;
  padding: 7px 9px;
  border: 1px solid var(--sg-border);
  border-radius: 8px;
  background: #fff;
  color: var(--sg-ink-900);
  font: inherit;
}

.practice-preview :deep(textarea) {
  width: 100%;
  min-height: 90px;
  resize: vertical;
}

.practice-preview :deep(a) {
  padding: 0;
  color: var(--sg-brand-text);
  font-weight: 700;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.practice-preview :deep(.base-card),
.practice-preview :deep(.parent-container),
.practice-preview :deep(.child-container),
.practice-preview :deep(.monitor),
.practice-preview :deep(.display-panel) {
  margin-top: 10px;
  padding: 12px;
  border: 1px solid var(--sg-border);
  border-radius: 10px;
  background: #f8fbff;
}

.practice-preview :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
}

.archive-view ::selection {
  color: #fff;
  background: var(--sg-brand);
}

@media (max-width: 860px) {
  .archive-intro {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .archive-summary {
    width: 100%;
  }

  .archive-summary div {
    flex: 1;
  }

  .practice-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .archive-view {
    min-height: auto;
    padding: 28px 16px;
    border-radius: 16px;
  }

  .archive-intro {
    gap: 20px;
    margin-bottom: 22px;
  }

  .archive-summary {
    gap: 8px;
  }

  .archive-summary div {
    min-width: 0;
    padding: 12px;
  }

  .archive-filter {
    top: 8px;
    width: 100%;
    margin-bottom: 32px;
  }

  .group-heading {
    align-items: start;
  }

  .group-heading > span {
    display: none;
  }

  .practice-preview {
    padding: 15px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .archive-filter button,
  .practice-preview :deep(button) {
    transition: none;
  }
}
</style>
