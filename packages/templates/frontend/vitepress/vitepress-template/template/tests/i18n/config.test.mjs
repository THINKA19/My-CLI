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
  const custom = api.config.transformHead({
    ...context,
    head: [['meta', { property: 'og:title', content: 'Custom' }], ['link', { rel: 'canonical', href: 'https://example.com/custom' }]],
  })
  assert.ok(!custom.some(([, attrs]) => attrs.property === 'og:title' || attrs.rel === 'canonical'))
})

it('真实扩展示例包含六个分区、六十个侧边栏页面以及多种导航类型', () => {
  const count = nodes => nodes.reduce((total, node) => total + 1 + (node.items ? count(node.items) : 0), 0)
  const links = nodes => nodes.flatMap(node => [...(node.link ? [node.link] : []), ...(node.items ? links(node.items) : [])])
  for (const language of ['zh', 'en', 'vi']) {
    const locale = api.localesConfig[language === 'zh' ? 'root' : language]
    const sections = Object.entries(locale.themeConfig.sidebar).filter(([prefix]) => prefix !== `/${language}/`)
    assert.equal(sections.length, 6)
    assert.equal(sections.reduce((total, [, items]) => total + links(items).length, 0), 60)
    for (const [prefix, items] of sections) {
      assert.equal(links(items).length, 10)
      assert.ok(links(items).every(link => link.startsWith(prefix)))
    }
    assert.equal(locale.themeConfig.nav.length, 7)
    assert.equal(count(locale.themeConfig.nav), 39)
    const navLinks = links(locale.themeConfig.nav)
    assert.ok(!navLinks.includes(`/${language}/catalog`))
    assert.ok(!navLinks.some(link => link.startsWith(`/${language}/demo/`)))
    assert.ok(navLinks.some(link => link.includes('#details')))
    assert.ok(navLinks.some(link => link.includes('?view=full')))
    assert.ok(navLinks.includes('https://vitepress.dev/guide/i18n'))
    assert.ok(navLinks.includes('mailto:docs@example.com'))
    assert.ok(locale.themeConfig.nav.some(node => node.items?.some(child => child.items)))
  }
})

it('示例使用真实且简短的文件，各语言都有六十篇分类页面', () => {
  const collect = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name)
    return entry.isDirectory() ? collect(file) : [file]
  })
  for (const language of ['zh', 'en', 'vi']) {
    const pages = collect(path.join(root, 'src', language)).filter(file => /page-\d+\.md$/.test(file))
    assert.ok(!fs.existsSync(path.join(root, 'src', language, 'demo')))
    assert.equal(pages.length, 60)
    assert.ok(pages.every(file => fs.readFileSync(file, 'utf8').trimEnd().split('\n').length <= 20))
  }
  for (const category of ['nav', 'sidebar']) {
    const files = collect(path.join(root, '.vitepress/config', category)).filter(file => file.endsWith('.ts'))
    assert.equal(files.length, 7)
    assert.ok(files.every(file => fs.readFileSync(file, 'utf8').trimEnd().split('\n').length <= 50))
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
