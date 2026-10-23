import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { createEnvironment } from './config/environment.ts'
import { featurePlugins } from './config/plugins.ts'

export default defineConfig(({ mode, command }) => {
  const env = createEnvironment(loadEnv(mode, process.cwd(), ''))
  return {
    base: env.base,
    plugins: [
      vue(),
      command === 'serve' && mode !== 'test' ? vueDevTools() : undefined,
      ...featurePlugins(),
    ],
    server: { host: '127.0.0.1', proxy: env.proxy },
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  }
})
