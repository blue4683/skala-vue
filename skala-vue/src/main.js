import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import SampleTwentyFive from './components/SampleTwentyFive.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.component('SampleTwentyFive', SampleTwentyFive)

app.mount('#app')
