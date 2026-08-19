<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import SampleView from './views/SampleView.vue';
import SampleTwo from './views/SampleTwo.vue';
import SampleThree from './views/SampleThree.vue';
import SampleFour from './views/SampleFour.vue';
import SampleFive from './views/SampleFive.vue';
import SampleSix from './views/SampleSix.vue';
import SampleSeven from './views/SampleSeven.vue';

</script>

<template>
  <div class="practice-grid">
    <SampleView />
    <SampleTwo />
    <SampleThree />
    <SampleFour />
    <SampleFive />
    <SampleSix /> 
    <SampleSeven />
  </div>
</template>

<style scoped>
.practice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
  align-items: start;
}

.practice-grid .practice-section {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.25rem;
  background-color: var(--color-background-soft);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
