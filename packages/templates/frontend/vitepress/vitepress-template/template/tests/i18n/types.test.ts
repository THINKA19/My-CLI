import type { MenuNode, MenuText } from '#config/i18n/types'
import './entry'

// 嵌套 key 必须保留字面量类型；每种语言使用同一个契约。
const nodes = [
  { key: 'group', items: [{ key: 'page', link: { path: '/page' } }] },
] as const satisfies readonly MenuNode[]

const complete = { group: 'Group', page: 'Page' } satisfies MenuText<typeof nodes>
// @ts-expect-error 缺少嵌套菜单 page 的翻译
const missing = { group: 'Group' } satisfies MenuText<typeof nodes>
// @ts-expect-error 拼错的 key 不属于结构
const misspelled = { group: 'Group', page: 'Page', paeg: 'Wrong' } satisfies MenuText<typeof nodes>
// @ts-expect-error 站内与原样链接不能同时设置
const invalidLink: MenuNode = { key: 'page', link: { path: '/page', url: 'https://example.com' } }

void [nodes, complete, missing, misspelled, invalidLink]
