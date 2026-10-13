import type { Bundle } from './schema.ts'
import fs from 'node:fs/promises'
import path from 'node:path'

export function render(bundle: Bundle): Map<string, string> {
  const files = new Map<string, string>()
  const chunks = bundle.nav.map((nav, index) => {
    const section = bundle.sidebar.find(item => `nav.${item.id}` === nav.key)
    const name = section?.id ?? (nav.key === 'nav.home' ? 'home' : `nav-${index}`)
    return { name, nav: [nav], sidebar: section ? [section] : [] }
  })
  for (const section of bundle.sidebar) {
    if (!chunks.some(chunk => chunk.sidebar.includes(section)))
      chunks.push({ name: `sidebar-${chunks.length}`, nav: [], sidebar: [section] })
  }
  if (!chunks.length)
    chunks.push({ name: 'home', nav: [], sidebar: [] })
  const usedNames = new Set<string>()
  for (const chunk of chunks) {
    if (!/^[\w-]+$/.test(chunk.name))
      throw new Error(`生成栏目名称无效: ${chunk.name}`)
    const originalName = chunk.name
    let suffix = 1
    while (usedNames.has(chunk.name)) chunk.name = `${originalName}-${suffix++}`
    usedNames.add(chunk.name)
    const keys = (nodes: any[]): string[] => nodes.flatMap(node => [node.key, ...keys(node.items ?? [])])
    const navKeys = new Set(keys(chunk.nav))
    const sidebarKeys = new Set(keys(chunk.sidebar.flatMap(section => [...section.items])))
    const texts = Object.fromEntries(Object.entries(bundle.texts).map(([code, text]) => [code, {
      nav: Object.fromEntries(Object.entries(text.nav).filter(([key]) => navKeys.has(key)).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)),
      sidebar: Object.fromEntries(Object.entries(text.sidebar).filter(([key]) => sidebarKeys.has(key)).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)),
    }]))
    files.set(`${chunk.name}.ts`, `// 自动生成，请修改 src 文档后运行 pnpm menus:generate。\nimport type { Bundle } from '../../../scripts/menus/schema.ts'\n\nexport default ${JSON.stringify({ nav: chunk.nav, sidebar: chunk.sidebar, texts }, null, 2)} satisfies Bundle\n`)
  }
  const names = chunks.map(chunk => chunk.name)
  files.set('index.ts', `// 自动生成，请勿手动修改。\n${names.map((name, index) => `import chunk${index} from './${name}.ts'`).join('\n')}\n\nexport default { chunks: [${names.map((_, index) => `chunk${index}`).join(', ')}] }\n`)
  return files
}

export async function write(root: string, files: Map<string, string>): Promise<void> {
  const directory = path.join(root, '.vitepress/config/generated')
  await fs.mkdir(directory, { recursive: true })
  // 完整构建和校验在写入前完成；仅操作 generated 内的文件。
  for (const [name, content] of files) {
    const file = path.join(directory, name)
    let old: string | undefined
    try {
      old = await fs.readFile(file, 'utf8')
    }
    catch (error: any) {
      if (error.code !== 'ENOENT')
        throw error
    }
    if (old === content)
      continue
    const temporary = `${file}.tmp`
    await fs.writeFile(temporary, content)
    await fs.rename(temporary, file)
  }
  for (const entry of await fs.readdir(directory)) {
    if (entry.endsWith('.ts') && !files.has(entry))
      await fs.unlink(path.join(directory, entry))
  }
}
