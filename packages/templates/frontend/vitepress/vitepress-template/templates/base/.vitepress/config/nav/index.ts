import type { Bundle } from '../../../scripts/menus/schema.ts'
import generated from '#config/generated/index'
import { languages } from '#config/menu/registry'
import { mergeText } from '#config/menu/resolve'

// 静态导入让 VitePress 跟踪所有生成文件；更新菜单后会重新加载主配置。
// dev/build/typecheck 已先生成菜单，直接运行 vitepress 前也需 menus:generate。
const chunks: Bundle[] = generated.chunks
export const navStructure = chunks.flatMap(chunk => chunk.nav)
export const generatedSidebar = chunks.flatMap(chunk => chunk.sidebar)
// 以语言注册表为准收集文字，并拒绝跨栏目重复 key，避免静默覆盖。
export const generatedTexts = Object.fromEntries(Object.keys(languages).map(code => [code, {
  nav: mergeText(...chunks.map(chunk => chunk.texts[code].nav)),
  sidebar: mergeText(...chunks.map(chunk => chunk.texts[code].sidebar)),
}]))
