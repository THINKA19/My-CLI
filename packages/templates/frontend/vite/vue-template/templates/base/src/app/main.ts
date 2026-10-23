import '@/ui/setup'
import '@/ui/styles/main.css'
import '@/ui/styles/platform.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { installFeatures } from './plugins'

const app = createApp(App)

installFeatures(app)
app.use(createPinia())
app.use(router)

app.mount('#app')
