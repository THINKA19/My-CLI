import { fileURLToPath } from 'node:url'
import { build } from './build.ts'
import { render, write } from './output.ts'
import { scan } from './scan.ts'

const root = fileURLToPath(new URL('../../', import.meta.url))
const command = process.argv[2]
try {
  if (!['generate', 'check'].includes(command))
    throw new Error('用法: tsx scripts/menus/index.ts generate|check')
  const input = await scan(root)
  const bundle = build(input)
  const files = render(bundle)
  if (command === 'generate')
    await write(root, files)
  console.log(`菜单${command === 'generate' ? '生成' : '校验'}成功：${input.codes.length} 种语言，${input.pages.length} 篇文档，${bundle.sidebar.length} 个侧边栏分区。`)
}
catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
