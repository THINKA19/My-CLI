import type { DefaultTheme, UserConfig } from 'vitepress'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import { transformSitemapItems } from './sitemap.ts'

const env = loadEnv(process.env.NODE_ENV === 'production' ? 'production' : 'development', fileURLToPath(new URL('../../', import.meta.url)), 'VITE_')
const base = env.VITE_BASE || '/'
if (!base.startsWith('/') || !base.endsWith('/'))
  throw new Error('VITE_BASE 必须以 / 开头和结尾')

/** 统一域名和部署子路径，SEO 与 sitemap 共用同一地址，避免重复拼接 base。 */
export function resolveSiteUrl(value: string, basePath: string): string {
  const url = new URL(value)
  if (!['http:', 'https:'].includes(url.protocol))
    throw new Error('VITE_SITE_URL 必须是 HTTP(S) 地址')
  const pathname = url.pathname.replace(/\/$/, '')
  if (pathname && pathname !== basePath.replace(/\/$/, ''))
    throw new Error('VITE_SITE_URL 的子路径必须与 VITE_BASE 一致')
  url.pathname = basePath
  url.search = ''
  url.hash = ''
  return url.href
}

export const siteUrl = resolveSiteUrl(env.VITE_SITE_URL || 'http://localhost:5173', base)

export const siteConfig = {
  base,
  cleanUrls: true,
  srcDir: './src',
  outDir: './dist',
  ignoreDeadLinks: [/^https?:\/\/localhost/],
  appearance: true,
  lastUpdated: true,
  sitemap: { hostname: siteUrl, transformItems: transformSitemapItems },
  vite: {
    publicDir: '../public',
    optimizeDeps: { include: ['mermaid'] },
  },
} satisfies UserConfig<DefaultTheme.Config>
