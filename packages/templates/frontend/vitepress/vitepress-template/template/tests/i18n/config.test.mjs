/* eslint-disable test/no-import-node-test -- 使用 Node.js 内置测试，不增加 Vitest 依赖。 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { loadConfigFromFile } from 'vite'

process.env.VITE_CONFIG_NATIVE_IGNORE_WARNING = 'true'
const root = fileURLToPath(new URL('../../', import.meta.url))
const { config: api } = await loadConfigFromFile(
  { command: 'serve', mode: 'development' },
  path.join(root, 'tests/i18n/entry.ts'),
)
const baseline = JSON.parse(fs.readFileSync(new URL('./baseline.json', import.meta.url), 'utf8'))

it('保持三种语言的菜单、页面地址和主题文案', () => {
  for (const [language, original] of Object.entries(baseline)) {
    const key = language === 'zh' ? 'root' : language
    const prefix = `/${language}/`
    const actual = api.localesConfig[key]
    assert.deepEqual(JSON.parse(JSON.stringify(actual.themeConfig.nav.slice(0, original.themeConfig.nav.length))), original.themeConfig.nav)
    assert.equal(actual.themeConfig.sidebar[prefix], undefined)
    assert.equal(actual.title, original.title)
    for (const field of ['footer', 'docFooter', 'notFound'])
      assert.deepEqual(actual.themeConfig[field], original.themeConfig[field])
    assert.equal(actual.themeConfig.outline.label, original.themeConfig.outline.label)
    assert.equal(actual.themeConfig.editLink.text, original.themeConfig.editLink.text)
  }
  assert.deepEqual(Object.keys(api.config.themeConfig.search.options.locales), ['root', 'en', 'vi'])
})

it('站内路径只加语言前缀；外部、资源和锚点链接保持原值', () => {
  assert.equal(api.resolveLink({ path: '/' }, '/en/'), '/en/')
  assert.equal(api.resolveLink({ path: '/guide/install#usage' }, '/en/'), '/en/guide/install#usage')
  assert.equal(api.resolveLink({ path: '/guide/install' }, '/'), '/guide/install')
  for (const url of ['https://example.com', 'mailto:hello@example.com', '/logo.svg', '#usage'])
    assert.equal(api.resolveLink({ url }, '/en/'), url)
  assert.equal(api.resolveText('key', {}, { key: 'Fallback' }), 'Fallback')
  assert.throws(() => api.resolveText('missing', {}, {}), /缺少文案/)
})

it('递归分组、折叠状态及最具体的侧边栏前缀', () => {
  const nodes = [{ key: 'group', collapsed: true, items: [{ key: 'page', link: { path: '/guide/page' } }] }]
  const text = { group: 'Group', page: 'Page' }
  const items = api.resolveSidebar(nodes, text, {}, '/en/')
  assert.equal(items[0].collapsed, true)
  assert.equal(items[0].items[0].link, '/en/guide/page')
  const result = api.resolveSidebars([
    { id: 'all', prefix: '/', items: nodes },
    { id: 'guide', prefix: '/guide/', items: nodes },
  ], text, {}, '/en/')
  assert.deepEqual(Object.keys(result), ['/en/guide/', '/en/'])
  assert.throws(() => api.mergeText({ key: 'A' }, { key: 'B' }), /重复文案/)
  assert.throws(() => api.resolveNav([{ key: 'group', items: nodes, link: { path: '/' } }], text, {}, '/'), /导航分组无效/)
})

it('配置校验拒绝缺失文案、重复 key/链接、带语言前缀和不存在的译文页面', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vitepress-i18n-'))
  try {
    fs.mkdirSync(path.join(dir, 'zh'))
    fs.writeFileSync(path.join(dir, 'zh', 'page.md'), '# Page')
    const node = { key: 'page', link: { path: '/page' } }
    api.validateMenu([node], { page: 'Page' }, 'zh', dir)
    assert.throws(() => api.validateMenu([node], {}, 'zh', dir), /缺少文案/)
    assert.throws(() => api.validateMenu([node, node], { page: 'Page' }, 'zh', dir), /重复菜单 key/)
    assert.throws(() => api.validateMenu([node, { ...node, key: 'other' }], { page: 'Page', other: 'Other' }, 'zh', dir), /重复菜单链接/)
    assert.throws(() => api.validateMenu([{ key: 'page', link: { path: '/en/page' } }], { page: 'Page' }, 'zh', dir), /不能带语言前缀/)
    assert.throws(() => api.validateMenu([node], { page: 'Page' }, 'en', dir), /页面不存在/)
    assert.throws(() => api.validateMenu([{ key: 'page', link: { path: '/../page' } }], { page: 'Page' }, 'zh', dir), /路径无效/)
    assert.throws(() => api.validateConfig(api.navStructure, [...api.sidebarSections, ...api.sidebarSections], api.localeTexts), /侧边栏分区重复/)
  }
  finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

it('三千个手动菜单节点可以通过相同接口解析', () => {
  const nodes = Array.from({ length: 3000 }, (_, index) => ({
    key: `api.page.${index}`,
    link: { path: `/api/page-${index}` },
  }))
  const text = Object.fromEntries(nodes.map((node, index) => [node.key, `Page ${index}`]))
  const result = api.resolveSidebar(nodes, text, {}, '/vi/')
  assert.equal(result.length, 3000)
  assert.equal(result[2999].link, '/vi/api/page-2999')
  assert.equal(result[2999].text, 'Page 2999')
})

it('公共主题的嵌套设置不会被语言文字覆盖', () => {
  for (const locale of Object.values(api.localesConfig)) {
    assert.deepEqual(locale.themeConfig.outline.level, [2, 5])
    assert.equal(locale.themeConfig.editLink.pattern, 'https://github.com/your-username/your-repo/edit/main/src/:path')
    assert.equal(locale.themeConfig.lastUpdated.formatOptions.dateStyle, 'short')
  }
  assert.ok(!('rewrites' in api.config))
})

it('页面 canonical 与部署 base 组合一次，首页和文章各有自己的地址', () => {
  assert.equal(api.resolveSiteUrl('https://example.com', '/docs/'), 'https://example.com/docs/')
  assert.equal(api.resolveSiteUrl('https://example.com/docs/', '/docs/'), 'https://example.com/docs/')
  assert.throws(() => api.resolveSiteUrl('https://example.com/other/', '/docs/'), /子路径/)
  assert.equal(api.pageUrl('zh/index.md', 'https://example.com/docs/'), 'https://example.com/docs/zh/')
  assert.equal(api.pageUrl('en/api-examples.md', 'https://example.com/docs/'), 'https://example.com/docs/en/api-examples')
  assert.equal(api.pageUrl('en/api-examples.html', 'https://example.com/', false), 'https://example.com/en/api-examples.html')
})

it('分享图片区分部署相对路径、域名绝对路径和 CDN 地址', () => {
  const base = 'https://example.com/docs/'
  assert.equal(api.imageUrl('share.png', base), `${base}share.png`)
  assert.equal(api.imageUrl('/share.png', base), 'https://example.com/share.png')
  assert.equal(api.imageUrl('/docs/share.png', base), `${base}share.png`)
  assert.equal(api.imageUrl('//cdn.example.com/share.png', base), 'https://cdn.example.com/share.png')
  assert.equal(api.imageUrl('https://cdn.example.com/share.png', base), 'https://cdn.example.com/share.png')
  assert.throws(() => api.imageUrl('data:image/png;base64,abc', base), /HTTP/)
})

it('sitemap 关联三种语言的真实页面，保留元数据且不制造缺失译文', () => {
  const items = [
    { url: 'zh/guide/', lastmod: '2026-10-13' },
    { url: 'en/guide/', links: [{ lang: 'en-US', url: 'en/guide/' }] },
    { url: 'vi/guide/' },
    { url: 'zh/only-chinese' },
    { url: '' },
  ]
  const result = api.transformSitemapItems(items)
  const variants = [
    { lang: 'zh-CN', url: 'zh/guide/' },
    { lang: 'en-US', url: 'en/guide/' },
    { lang: 'vi-VN', url: 'vi/guide/' },
  ]
  for (const item of result.slice(0, 3)) assert.deepEqual(item.links, variants)
  assert.equal(result[0].lastmod, '2026-10-13')
  assert.equal(result[3].links, undefined)
  assert.equal(result[4].links, undefined)
  assert.equal(items[0].links, undefined)
})

it('导航高亮的多个栏目共用语言路径起点', () => {
  const resolve = prefix => api.resolveNav([
    { key: 'guide', link: { path: '/guide/' }, activeMatch: '^/(guide|api)/' },
  ], { guide: 'Guide' }, {}, prefix)[0].activeMatch
  const pattern = new RegExp(resolve('/en/'))
  assert.ok(pattern.test('/en/guide/page'))
  assert.ok(pattern.test('/en/api/page'))
  assert.ok(!pattern.test('/api/page'))
  assert.ok(!pattern.test('/zh/guide/page'))
})

it('SEO 使用页面标题和描述，并保留显式的页面分享标签', () => {
  const context = {
    page: 'en/api-examples.md',
    title: 'API page',
    description: 'Page description',
    siteConfig: { cleanUrls: true },
    pageData: { frontmatter: {} },
    head: [],
  }
  const result = api.config.transformHead(context)
  assert.equal(result.find(([, attrs]) => attrs.property === 'og:title')[1].content, 'API page')
  assert.equal(result.find(([, attrs]) => attrs.name === 'twitter:description')[1].content, 'Page description')
  assert.ok(result.find(([, attrs]) => attrs.rel === 'canonical')[1].href.endsWith('/en/api-examples'))
  assert.equal(result.find(([, attrs]) => attrs.name === 'twitter:card')[1].content, 'summary')
  assert.ok(!result.some(([, attrs]) => attrs.property === 'og:image' || attrs.name === 'twitter:image'))
  const withImage = api.config.transformHead({ ...context, pageData: { frontmatter: { image: '//cdn.example.com/share.png' } } })
  assert.ok(withImage.find(([, attrs]) => attrs.property === 'og:image')[1].content.endsWith('//cdn.example.com/share.png'))
  assert.equal(withImage.find(([, attrs]) => attrs.name === 'twitter:card')[1].content, 'summary_large_image')
  const custom = api.config.transformHead({
    ...context,
    head: [['meta', { property: 'og:title', content: 'Custom' }], ['link', { rel: 'canonical', href: 'https://example.com/custom' }]],
  })
  assert.ok(!custom.some(([, attrs]) => attrs.property === 'og:title' || attrs.rel === 'canonical'))
  const customImage = api.config.transformHead({
    ...context,
    head: [['meta', { property: 'og:image', content: 'https://example.com/custom.png' }]],
  })
  assert.ok(!customImage.some(([, attrs]) => attrs.property === 'og:image'))
  assert.equal(customImage.find(([, attrs]) => attrs.name === 'twitter:card')[1].content, 'summary_large_image')
})

it('默认图标引用模板内实际提供的资源', () => {
  const icons = api.config.head.filter(([tag, attrs]) => tag === 'link' && ['icon', 'apple-touch-icon'].includes(attrs.rel))
  assert.ok(icons.length)
  for (const [, attrs] of icons) {
    assert.ok(attrs.href.startsWith(api.config.base))
    assert.ok(fs.existsSync(path.join(root, 'public', attrs.href.slice(api.config.base.length))))
  }
})

it('生成菜单匹配文档分区，并保留外部导航', () => {
  const links = nodes => nodes.flatMap(node => [...(node.link ? [node.link] : []), ...(node.items ? links(node.items) : [])])
  for (const language of ['zh', 'en', 'vi']) {
    const locale = api.localesConfig[language === 'zh' ? 'root' : language]
    for (const [prefix, items] of Object.entries(locale.themeConfig.sidebar)) {
      const category = prefix.split('/')[2]
      const pages = fs.readdirSync(path.join(root, 'src', language, category)).filter(file => file.endsWith('.md') && file !== 'index.md')
      assert.equal(links(items).length, pages.length)
      assert.ok(links(items).every(link => link.startsWith(prefix)))
    }
    const navLinks = links(locale.themeConfig.nav)
    assert.ok(navLinks.includes('https://vitepress.dev/guide/i18n'))
    assert.ok(navLinks.includes('mailto:docs@example.com'))
    assert.ok(!navLinks.some(link => link.includes('/demo/')))
  }
})

it('根首页提供默认语言跳转，各语言顶层仅保留 index.md 和分类目录', () => {
  const head = api.config.transformHead({
    page: 'index.md',
    title: 'Documentation',
    description: '',
    siteConfig: { cleanUrls: true },
    pageData: { frontmatter: {} },
    head: [],
  })
  assert.equal(head.find(([, attrs]) => attrs['http-equiv'] === 'refresh')[1].content, `0;url=${api.config.base}zh/`)
  assert.ok(fs.readFileSync(path.join(root, 'src/index.md'), 'utf8').includes('RootRedirect'))
  for (const language of ['zh', 'en', 'vi']) {
    const entries = fs.readdirSync(path.join(root, 'src', language), { withFileTypes: true })
    assert.deepEqual(entries.filter(entry => entry.isFile()).map(entry => entry.name), ['index.md'])
    assert.equal(entries.filter(entry => entry.isDirectory()).length, 6)
  }
})
