<script setup lang="ts">
import PropsEmitsParent from './PropsEmitsParent.vue';
import SampleEighteen from './SampleEighteen.vue';
import SampleNineteen from './SampleNineteen.vue';
import SampleTwenty from './SampleTwenty.vue';
import SampleTwentyFour from './SampleTwentyFour.vue';
import SampleTwentyOne from './SampleTwentyOne.vue';
import SampleTwentyThree from './SampleTwentyThree.vue';
import SampleTwentyTwo from './SampleTwentyTwo.vue';
import SlotDefaultParent from './SlotDefaultParent.vue';
import SlotNamedParent from './SlotNamedParent.vue';
import SlotScopedParent from './SlotScopedParent.vue';

</script>

<template>
  <div class="practice-grid">
    <SampleEighteen />
    <SampleNineteen />
    <SampleTwenty />
    <SampleTwentyOne />
    <SampleTwentyTwo />
    <SampleTwentyThree />
    <SampleTwentyFour />
    <SampleTwentyFive />
    <PropsEmitsParent />
    <SlotDefaultParent />
    <SlotNamedParent />
    <SlotScopedParent />
  </div>
</template>

<style>
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
