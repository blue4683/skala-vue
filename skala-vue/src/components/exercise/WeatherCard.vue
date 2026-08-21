<script setup>
import {computed} from 'vue'
import {ArrowRight, Location} from '@element-plus/icons-vue'

const props = defineProps({
    city: {type: Object, required: true},
})

const emit = defineEmits(['select-card', 'click-detail'])

const displayTemp = computed(() => {
    const rawTemp = props.city.temp

    return rawTemp.toFixed(1)
})
</script>

<template>
    <article
        class="city-card"
        tabindex="0"
        @click="emit('select-card', city)"
    >
        <div class="condition-icon" :class="{ rainy: city.status === '비', cloudy: city.status === '구름'}">
            {{ city.status === '비' ? '☔️' : city.status === '구름' ? '☁️' : '☀️' }}
        </div>
        <div class="city-info">
            <div class="city-heading">
                <el-icon><Location /></el-icon>
                <strong>{{ city.name }}</strong>
                <span>{{ city.status }}</span>
            </div>
            <p class="city-temp">
                <b>{{ displayTemp }}</b>
                <span>습도 {{ city.humidity }}%</span>
            </p>
            <div class="badge-row">
                <el-tag :type="city.temp >= 25 ? 'danger' : 'primary'" effect="light" round size="small">
                    {{ city.temp >= 25 ? '더움' : '선선함' }}
                </el-tag>
                <el-tag type="warning" effect="light" round size="small">
                    불쾌지수 {{ city.discomfortIndex.toFixed(1) }} {{ city.discomfortLevel.label }}
                </el-tag>
            </div>
        </div>
        <el-button class="detail-button" text type="primary" @click.stop="emit('click-detail', city.name)">
            상세 <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
    </article>
</template>

<style scoped>
</style>