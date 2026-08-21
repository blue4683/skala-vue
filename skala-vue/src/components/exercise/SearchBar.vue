<script setup>
defineProps({
    cityName: {
        type: String,
        required: true,
    },
})

const emit = defineEmits(['update-query'])
</script>

<template>
    <input
        type="text"
        :value="cityName"
        @change="emit('update-query', $event.target.value)"
        placeholder="검색할 도시 이름 입력"
    >
    <p class="city-search-result">검색 중인 도시: {{ cityName }}</p>
</template>

<style scoped>
input[type='text'] {
    width: 100%;
    box-sizing: border-box;
    padding: 0.5rem 0.75rem;
    border: 1px solid #cfd4de;
    border-radius: 6px;
    background-color: #fff;
    font-size: 0.95rem;
}

.city-search-result {
    margin: 0.6rem 0 0;
    color: #4a5062;
    font-size: 0.9rem;
}
</style>
