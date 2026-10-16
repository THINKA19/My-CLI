import { fileURLToPath } from 'node:url'
import { build, loadEnv } from 'vitepress'

const root = fileURLToPath(new URL('../../', import.meta.url))
const env = loadEnv('production', root, 'VITE_')
const base = env.VITE_BASE || '/'
const siteUrl = env.VITE_SITE_URL
if (!base.startsWith('/') || !base.endsWith('/'))
  throw new Error('VITE_BASE 必须以 / 开头和结尾，例如 / 或 /docs/')
if (!siteUrl || !/^https?:\/\//.test(siteUrl))
  throw new Error('部署构建需要设置完整的 VITE_SITE_URL')
// base 是部署目录，不能包含跨域地址、查询参数或目录跳转。
const resolvedBase = new URL(base, 'https://deployment.invalid')
if (resolvedBase.origin !== 'https://deployment.invalid' || resolvedBase.pathname !== base || resolvedBase.search || resolvedBase.hash || /[%\\]/.test(base) || base.includes('//'))
  throw new Error('VITE_BASE 必须是规范的站内目录路径')
const url = new URL(siteUrl)
if (url.search || url.hash || url.username || url.password)
  throw new Error('VITE_SITE_URL 不应包含查询参数、锚点或账号凭据')

// SEO 与 sitemap 的地址统一由 site.ts 处理，保留部署子路径及页面级分享设置。
await build(root, {
  // 在站点配置解析后覆盖，确保 Docker 开关不会因配置文件版本不同而失效。
  onAfterConfigResolve(config) {
    if (env.VITE_LAST_UPDATED === 'false') {
      config.lastUpdated = false
      console.log('本次部署构建不读取 Git 更新时间')
    }
  },
})
