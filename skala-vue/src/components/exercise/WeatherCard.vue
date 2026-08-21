<script setup>
defineProps({
    city: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['select-card', 'click-detail'])
</script>

<template>
    <div class="city-card" @click="emit('select-card', city)">
        <div class="city-info">
            <p class="city-name">{{ city.name }} ({{ city.status }})</p>
            <p class="city-temp">현재 기온: {{ city.temp }}℃ / 상대습도: {{ city.humidity }}%</p>
            <div class="badge-row">
                <span :class="['badge', city.temp >= 25 ? 'badge-hot' : 'badge-cool']">
                    {{ city.temp >= 25 ? '🔥 더움 (25도 이상)' : '❄️ 선선함 (25도 미만)' }}
                </span>
                <span :class="['badge', city.discomfortLevel.className]">
                    {{ city.discomfortLevel.emoji }} 불쾌지수 {{ city.discomfortIndex.toFixed(1) }} ({{ city.discomfortLevel.label }})
                </span>
            </div>
        </div>
        <button class="btn-external" @click.stop="emit('click-detail', city.id)">상세보기</button>
    </div>
</template>

<style scoped>
.city-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.9rem 1rem;
    margin-top: 0.75rem;
    background-color: #fff;
    border: 1px solid #e2e5eb;
    border-radius: 8px;
    cursor: pointer;
    transition: box-shadow 0.15s ease, transform 0.1s ease;
}

.city-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.city-card:first-of-type {
    margin-top: 0;
}

.city-info {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.city-name {
    margin: 0;
    font-weight: 600;
    color: #1f2430;
}

.city-temp {
    margin: 0;
    color: #4a5062;
    font-size: 0.9rem;
}

.badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #fff;
    width: fit-content;
}

.badge-hot {
    background-color: #e15b5b;
}

.badge-cool {
    background-color: #4a90d9;
}

.badge-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
}

.badge-di-low {
    background-color: #4a90d9;
}

.badge-di-normal {
    background-color: #5cb85c;
}

.badge-di-high {
    background-color: #e8a33d;
}

.badge-di-very-high {
    background-color: #e15b5b;
}

.btn-external {
    display: inline-block;
    flex-shrink: 0;
    padding: 0.4rem 0.9rem;
    border: 1px solid #cfd4de;
    border-radius: 6px;
    background-color: #f4f6fb;
    color: #1f2430;
    font-weight: 600;
    font-size: 0.85rem;
    text-decoration: none;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
}

.btn-external:hover {
    background-color: #e2e5eb;
}

.btn-external:active {
    transform: scale(0.97);
}
</style>
