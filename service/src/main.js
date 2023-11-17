import './assets/main.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.config.globalProperties.$hostname = 'https://sandbox.exi.moe/bdo-market/app/'

app.mount('#app')
