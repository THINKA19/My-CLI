/* eslint-disable test/no-import-node-test -- 使用 Node.js 内置测试。 */
import type { Input, Page } from '../../scripts/menus/schema.ts'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { it } from 'node:test'
import { filterMenu, resolveNav } from '../../.vitepress/config/menu/resolve.ts'
import { build } from '../../scripts/menus/build.ts'
import { render, write } from '../../scripts/menus/output.ts'
import { scan } from '../../scripts/menus/scan.ts'
import { metadata } from '../../scripts/menus/schema.ts'

const page = (language: string, relative: string, menu = {}): Page => ({ language, relative, id: relative.replace(/\.md$/, ''), route: `/${relative.replace(/index\.md$/, '').replace(/\.md$/, '')}`, title: `${language}:${relative}`, translate: true, menu })
function input(): Input {
  return { codes: ['zh', 'en'], primary: 'zh', extras: [], pages: ['zh', 'en'].flatMap(code => [
    page(code, 'guide/index.md', { id: 'guide', nav: { enabled: true, mode: 'dropdown' } }),
    page(code, 'guide/a.md', { nav: { enabled: true, activeMatch: '^/guide/' } }),
    page(code, 'guide/b.md'),
  ]).map(item => ({ ...item, id: item.menu.id ?? item.id })) }
}

it('新增文档自动进入侧边栏，导航只收集启用的页面，语言高亮正确', () => {
  const result = build(input())
  assert.equal(result.sidebar[0].items[0].items?.length, 2)
  assert.equal(result.nav[0].items?.length, 1)
  const nav = resolveNav(result.nav, result.texts.en.nav, {}, '/en/')
  assert.equal((nav[0] as any).items[0].link, '/en/guide/a')
  assert.equal((nav[0] as any).items[0].activeMatch, '^/en/guide/')
  assert.equal(result.texts.en.sidebar['sidebar.guide/a'], 'en:guide/a.md')
})

it('缺翻译默认报错，translate:false 只在原语言出现', () => {
  const data = input()
  data.pages = data.pages.filter(item => !(item.language === 'en' && item.relative === 'guide/a.md'))
  assert.throws(() => build(data), /缺少翻译/)
  data.pages.find(item => item.relative === 'guide/a.md')!.translate = false
  const result = build(data)
  assert.equal(filterMenu(result.nav, 'en').length, 0)
  assert.equal(filterMenu(result.nav, 'zh')[0].items?.length, 1)
})

it('未知字段、错误类型和正则被拒绝，同序允许稳定排序', () => {
  assert.throws(() => metadata({ nav: { enabld: true } }, 'a.md'), /未知/)
  assert.throws(() => metadata({ sidebar: { order: '1' } }, 'a.md'), /数字/)
  assert.throws(() => metadata({ nav: { activeMatch: '^/[' } }, 'a.md'), /正则/)
  assert.throws(() => metadata({ nav: { activeMatch: '^/guide/|^/api/' } }, 'a.md'), /多路径/)
  assert.throws(() => metadata({ nav: { activeMatch: '^/guide/|/api/' } }, 'a.md'), /多路径/)
  assert.throws(() => metadata({ nav: { activeMatch: '^/(guide|api)/|/other/' } }, 'a.md'), /多路径/)
  assert.throws(() => metadata({ nav: { activeMatch: '^/guide\\|literal/|/api/' } }, 'a.md'), /多路径/)
  assert.doesNotThrow(() => metadata({ nav: { activeMatch: '^/(guide|api)/' } }, 'a.md'))
  assert.doesNotThrow(() => metadata({ nav: { activeMatch: '^/guide[|()]/' } }, 'a.md'))
  assert.doesNotThrow(() => metadata({ nav: { activeMatch: '^/guide\\|literal/' } }, 'a.md'))
  assert.doesNotThrow(() => metadata({ nav: { activeMatch: '^/(?:guide|api)/(install|usage)$' } }, 'a.md'))
  assert.deepEqual(render(build(input())), render(build({ ...input(), pages: input().pages.reverse() })))
})

it('重复页面、缺父分组和循环引用被拒绝', () => {
  const data = input()
  assert.throws(() => build({ ...data, pages: [...data.pages, data.pages[0]] }), /重复/)
  data.pages[1].menu.nav = { enabled: true, parent: 'missing' }
  assert.throws(() => build(data), /父导航/)
  const cycle = input()
  cycle.pages[0].menu.nav!.parent = 'guide'
  assert.throws(() => build(cycle), /循环/)
})

it('无正文分组可接受文档子项，外部链接必须有各语言文案', () => {
  const data = input()
  data.pages[0].menu.nav!.enabled = false
  data.pages[1].menu.nav!.parent = 'resources'
  data.extras = [{ id: 'resources', text: { zh: '资源', en: 'Resources' }, items: [] }]
  assert.equal(build(data).nav[0].items?.length, 1)
  data.extras.push({ id: 'external', link: 'https://example.com', text: { zh: '外链' } })
  assert.throws(() => build(data), /缺少外部菜单翻译/)
})

it('扫描真实 YAML，检查不写文件，输出可重复并清理已删除栏目', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'menus-'))
  try {
    await fs.mkdir(path.join(root, '.vitepress/config/menu'), { recursive: true })
    await fs.writeFile(path.join(root, '.vitepress/config/menu/registry.ts'), 'export const languages = { zh: {configKey: \'root\', sourceDir: \'zh\'} }')
    await fs.mkdir(path.join(root, 'src/zh'), { recursive: true })
    await fs.writeFile(path.join(root, 'src/zh/a.md'), '---\ntitle: A\nmenu:\n  nav:\n    enabled: true\n---\n# A\n')
    const result = build(await scan(root))
    const files = render(result)
    await assert.rejects(fs.access(path.join(root, '.vitepress/config/generated')))
    await write(root, files)
    const file = path.join(root, '.vitepress/config/generated/index.ts')
    const time = (await fs.stat(file)).mtimeMs
    await write(root, files)
    assert.equal((await fs.stat(file)).mtimeMs, time)
    await fs.writeFile(path.join(root, '.vitepress/config/generated/old.ts'), 'old')
    await write(root, files)
    await assert.rejects(fs.access(path.join(root, '.vitepress/config/generated/old.ts')))
    await fs.writeFile(path.join(root, 'src/zh/a.md'), '---\ntitle: A\ntitle: B\n---\n')
    await assert.rejects(scan(root), /unique|重复/i)
  }
  finally { await fs.rm(root, { recursive: true, force: true }) }
})

it('三千个文档菜单通过同一生成接口', () => {
  const data = input()
  data.pages.push(...Array.from({ length: 3000 }, (_, index) => ['zh', 'en'].map(code => page(code, `guide/extra-${index}.md`))).flat())
  assert.equal(build(data).sidebar[0].items[0].items?.length, 3002)
})

it('首页与同名栏目输出不会互相覆盖', () => {
  const data = input()
  data.pages.unshift(...['zh', 'en'].map(code => ({ ...page(code, 'index.md'), id: 'home', menu: { nav: { enabled: true, order: 0 } } })))
  const result = build(data)
  result.sidebar[0].id = 'home'
  result.nav[1].key = 'nav.home'
  const files = render(result)
  assert.ok(files.has('home.ts'))
  assert.ok(files.has('home-1.ts'))
})
