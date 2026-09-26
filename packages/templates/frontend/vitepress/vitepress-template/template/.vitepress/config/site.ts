import type { DefaultTheme, UserConfig } from 'vitepress'

/** 站点部署的基准路径 (Base URL) */
const VITE_BASE = (import.meta.env?.VITE_BASE as string) || '/'
/** 站点生产环境完整域名 (用于 RSS、Sitemap 生成) */
const VITE_SITE_URL = (import.meta.env?.VITE_SITE_URL as string)

/**
 * 站点配置
 */
export const siteConfig: UserConfig<DefaultTheme.Config> = {
  // ==================== 1. 站点元数据 ====================
  title: '我的文档站点',
  titleTemplate: "自定义标题后缀",
  description: '基于 VitePress 的项目文档',
  head: [
    [
      'link',
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' }
    ],
    [
      'link',
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
    ],
    [
      'link',
      { href: 'https://fonts.googleapis.com/css2?family=Roboto&display=swap', rel: 'stylesheet' }
    ]
  ],
  lang: 'zh-CN',
  /** 
   * 站点部署的基准路径 (Base URL)
   * - 部署在根域名 (https://example.com/) 时设为 '/'
   * - 部署在 GitHub Pages 或子路径 (https://example.com/docs/) 时设为 '/docs/'
   * - 建议：生产环境可通过 import.meta.env.VITE_BASE 动态读取
   */
  base: VITE_BASE,

  // ==================== 2. 路由 ====================
  cleanUrls: true,
  rewrites: {
    'index.md': 'api/index.md',
    // ':path*': 'api/:path*'
  },

  // ==================== 3. 构建 ====================
  srcDir: './src',
  srcExclude: ['**/README.md', '**/TODO.md'],
  outDir: './dist',
  assetsDir: 'static',
  // cacheDir: './.vitepress/.vite',
  ignoreDeadLinks: [
    /^https?:\/\/localhost/
  ],


  // ==================== 4. 主题 ====================
  appearance: true,
  lastUpdated: true,

  // ==================== 5. 构建钩子 ====================
  /**
   * 自动生成 sitemap.xml 供搜索引擎抓取 (SEO 核心配置)
   * - 替换为你的真实线上域名
   */
  sitemap: {
    hostname: VITE_SITE_URL
  },
  /**
  * Vite底层配置，VitePress是基于Vite构建，这里直接透传Vite配置项
  * - publicDir：指定静态资源public文件夹的位置
  * - 当前srcDir是 ./src，配置文件运行时的基准目录在 src/.vitepress
  * - public目录里面放置logo、图片等不需要编译、直接原样输出的静态资源
  */
  vite: {
    publicDir: '../public'
  },
}