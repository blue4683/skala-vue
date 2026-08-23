<template>
  <div class="about">
    <div class="starfield" aria-hidden="true" />
    <h1>This is an about page</h1>
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

.about h1 {
  position: relative;
  z-index: 1;
  color: var(--sg-text-inverse-900);
}

@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
  }
}
</style>
