<script setup>
defineProps({
    title: {
        type: String,
        required: true,
    },
})
</script> 

<template>
    <div class="practice-section">
        <h3>{{ title }}</h3>
        <slot />
    </div>
</template>

<style scoped>
.practice-section {
    margin: 1rem 1.5rem;
    padding: 1rem 1.1rem;
    background-color: #f4f6fb;
    border: 1px solid #e2e5eb;
    border-radius: 10px;
}

.practice-section h3 {
    margin: 0 0 0.75rem;
    font-size: 1rem;
    font-weight: 700;
    color: #1f2430;
}
</style>
