<script setup>
import {ref} from 'vue'
import PropsEmitsChild from './PropsEmitsChild.vue'

const message = ref('Parent 초기 메시지')

const handleUpdateRequest = (newValue) => {
    message.value = newValue
}
</script>

<template>
    <div class="practice-section">
        <h2>Props & Emits</h2>
        <div class="parent-container">
            <h2>상위 컴포넌트 (Parent)</h2>
            <p>
                현재 로컬 데이터(State): <strong>{{ message }}</strong>
            </p>
            <br>
            <PropsEmitsChild :parent-data="message" @update-request="handleUpdateRequest" />
        </div>
    </div>
</template>