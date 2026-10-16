import type { Extra, Input, Page } from './schema.ts'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseDocument } from 'yaml'
import { metadata } from './schema.ts'

export async function scan(root: string): Promise<Input> {
  const { languages } = await import(pathToFileURL(path.join(root, '.vitepress/config/menu/registry.ts')).href)
  const codes = Object.keys(languages)
  const primary = codes.find(code => languages[code].configKey === 'root') || codes[0]
  const pages: Page[] = []
  async function visit(dir: string, base: string, language: string): Promise<void> {
    for (const entry of (await fs.readdir(dir, { withFileTypes: true })).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
      if (entry.name.startsWith('.'))
        continue
      const file = path.join(dir, entry.name)
      if (entry.isSymbolicLink())
        throw new Error(`不支持文档符号链接: ${file}`)
      if (entry.isDirectory()) {
        await visit(file, base, language)
        continue
      }
      if (!entry.name.endsWith('.md'))
        continue
      const content = (await fs.readFile(file, 'utf8')).replace(/^\uFEFF/, '')
      const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
      if (content.startsWith('---\n') || content.startsWith('---\r\n')) {
        if (!match)
          throw new Error(`${file}: frontmatter 缺少结束分隔符`)
      }
      let data: Record<string, any> = {}
      if (match) {
        const document = parseDocument(match[1])
        if (document.errors.length)
          throw new Error(`${file}: ${document.errors[0].message}`)
        data = document.toJS() || {}
        if (typeof data !== 'object' || Array.isArray(data))
          throw new Error(`${file}: frontmatter 必须是对象`)
      }
      const title = data.title ?? content.match(/^# ([^\r\n]+)$/m)?.[1]?.trim()
      if (typeof title !== 'string' || !title.trim())
        throw new Error(`${file}: 缺少页面标题`)
      if (data.translate !== undefined && typeof data.translate !== 'boolean')
        throw new Error(`${file}: translate 必须是布尔值`)
      const relative = path.relative(base, file).split(path.sep).join('/')
      if (/[?#%\\]/.test(relative))
        throw new Error(`${file}: 文档路径不能包含 URL 保留字符`)
      const route = `/${relative.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')}`
      const menu = metadata(data.menu, file)
      pages.push({ language, relative, route, id: menu.id ?? relative.replace(/\.md$/, ''), title, translate: data.translate !== false, menu })
    }
  }
  for (const code of codes) {
    const base = path.join(root, 'src', languages[code].sourceDir)
    await visit(base, base, code)
  }
  let extras: Extra[] = []
  const extraFile = path.join(root, 'src/menu.config.ts')
  try {
    await fs.access(extraFile)
  }
  catch (error: any) {
    if (error.code !== 'ENOENT')
      throw error
    return { codes, primary, pages, extras }
  }
  const config = (await import(`${pathToFileURL(extraFile).href}?mtime=${(await fs.stat(extraFile)).mtimeMs}`)).default
  if (!config || Object.keys(config).some(key => key !== 'nav') || !Array.isArray(config.nav))
    throw new Error('menu.config.ts 只能提供 nav 数组')
  extras = config.nav
  return { codes, primary, pages, extras }
}
