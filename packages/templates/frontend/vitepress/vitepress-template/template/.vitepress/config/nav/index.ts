import type { Bundle } from '../../../scripts/menus/schema.ts'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { loadConfigFromFile } from 'vite'

const file = fileURLToPath(new URL('../generated/index.ts', import.meta.url))
if (!fs.existsSync(file)) throw new Error('菜单生成文件不存在，请先运行 pnpm menus:generate（pnpm dev / build 会自动生成）。')
const loaded = await loadConfigFromFile({ command: 'serve', mode: 'development' }, file)
if (!loaded) throw new Error('菜单生成文件加载失败，请运行 pnpm menus:generate。')
const chunks = (loaded.config as unknown as { chunks: Bundle[] }).chunks
export const navStructure = chunks.flatMap(chunk => chunk.nav)
export const generatedSidebar = chunks.flatMap(chunk => chunk.sidebar)
export const generatedTexts = Object.fromEntries(Object.keys(chunks[0]?.texts ?? {}).map(code => [code, {
  nav: Object.assign({}, ...chunks.map(chunk => chunk.texts[code].nav)) as Record<string, string>,
  sidebar: Object.assign({}, ...chunks.map(chunk => chunk.texts[code].sidebar)) as Record<string, string>,
}]))
