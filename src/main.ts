import { createApp } from 'vue'

import App from '@/App.vue'
import { getLocale } from '@/paraglide/runtime'

import './styles.css'

const app = createApp(App)

document.documentElement.setAttribute('lang', getLocale())

app.mount('#app')