import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import router from './router'

//elementPlus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

//pinia
import { createPinia } from 'pinia'
const pinia = createPinia()


createApp(App).use(ElementPlus).use(router).use(pinia).mount('#app')
