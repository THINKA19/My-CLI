import fs from 'node:fs'
import path from 'node:path'

export const featureLabels = { 'code-quality': '代码规范', 'unit-test': '单元测试', 'e2e': '端到端测试' }
export function normalizeOptions(input = {}) {
  const features = input.features ?? []
  if (!Array.isArray(features) || features.some(f => !Object.hasOwn(featureLabels, f)))
    throw new Error('功能仅支持 code-quality、unit-test、e2e')
  return { location: input.location || '.', features: Object.keys(featureLabels).filter(f => features.includes(f)), install: Boolean(input.install) }
}
export function assertTarget(target) {
  let current = target
  while (true) {
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink())
      throw new Error('目标路径不能经过符号链接')
    const parent = path.dirname(current)
    if (parent === current)
      break
    current = parent
  }
  if (fs.existsSync(target) && (!fs.statSync(target).isDirectory() || fs.readdirSync(target).some(name => name !== '.git')))
    throw new Error('目标必须为空目录（允许保留 .git）')
}

export const help = `用法：create-vue-template [目录] [选项]
  --yes, -y           非交互创建
  --features=code-quality,unit-test,e2e  选择功能，默认全部不选
  --features=         全部不选
  --install           安装依赖，默认不安装
  --help, -h          帮助
项目名取目标目录名，例如 my-vue-app。`
export function parseArgs(args) {
  if (args.includes('--help') || args.includes('-h'))
    return { help: true }
  const options = normalizeOptions()
  const locations = []
  let yes = false
  for (const arg of args) {
    if (['--yes', '-y'].includes(arg))
      yes = true
    else if (arg.startsWith('--features='))
      options.features = arg.slice('--features='.length) === '' ? [] : arg.slice('--features='.length).split(',')
    else if (arg === '--install')
      options.install = true
    else if (arg.startsWith('-'))
      throw new Error(`未知参数：${arg}`)
    else locations.push(arg)
  }
  if (locations.length > 1)
    throw new Error('只能指定一个创建目录')
  options.location = locations[0] || '.'
  return { options: normalizeOptions(options), yes }
}
