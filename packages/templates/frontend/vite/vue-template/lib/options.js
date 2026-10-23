import fs from 'node:fs'
import path from 'node:path'
import { defaultHttp, httpLibraries } from './http.js'
import { defaultType, projectTypes } from './project-types.js'
import { uiLibraries } from './ui.js'

export const featureLabels = { 'code-quality': '代码规范', 'unit-test': '单元测试', 'e2e': '端到端测试', 'jsx': 'JSX 支持' }
export function normalizeOptions(input = {}) {
  const http = input.http ?? defaultHttp
  if (typeof http !== 'string' || !Object.hasOwn(httpLibraries, http))
    throw new Error('HTTP 请求库必须单选：axios、alova')
  const type = input.type ?? defaultType
  if (typeof type !== 'string' || !Object.hasOwn(projectTypes, type))
    throw new Error('项目类型必须单选：mobile、admin')
  const project = projectTypes[type]
  const ui = input.ui ?? project.defaultUi
  if (typeof ui !== 'string' || !Object.hasOwn(uiLibraries, ui))
    throw new Error(`UI 组件库必须单选：${project.ui.join('、')}`)
  if (!project.ui.includes(ui))
    throw new Error(`${project.label}不支持 ${ui}，支持：${project.ui.join('、')}`)
  const features = input.features ?? []
  if (!Array.isArray(features) || features.some(f => !Object.hasOwn(featureLabels, f)))
    throw new Error('功能仅支持 code-quality、unit-test、e2e、jsx')
  return { type, http, ui, location: input.location || '.', features: Object.keys(featureLabels).filter(f => features.includes(f)), install: Boolean(input.install) }
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
  --features=code-quality,unit-test,e2e,jsx  选择功能，默认全部不选
  --features=         全部不选
  --type=admin        项目类型单选：mobile（移动端 H5）、admin（PC 中后台，默认）
  --ui=<包名>         mobile：vant（默认）、@nutui/nutui、tdesign-mobile-vue
                      admin：ant-design-vue（默认）、element-plus、naive-ui、tdesign-vue-next
  --http=axios        HTTP 单选：axios（默认）、alova
  --install           安装依赖，默认不安装
  --help, -h          帮助
项目名取目标目录名，例如 my-vue-app。`
export function parseArgs(args) {
  if (args.includes('--help') || args.includes('-h'))
    return { help: true }
  const options = {}
  const locations = []
  let yes = false
  let uiSpecified = false
  let typeSpecified = false
  let httpSpecified = false
  for (const arg of args) {
    if (['--yes', '-y'].includes(arg)) {
      yes = true
    }
    else if (arg.startsWith('--features=')) {
      options.features = arg.slice('--features='.length) === '' ? [] : arg.slice('--features='.length).split(',')
    }
    else if (arg.startsWith('--type=')) {
      if (typeSpecified)
        throw new Error('项目类型只能指定一次')
      typeSpecified = true
      options.type = arg.slice('--type='.length)
    }
    else if (arg.startsWith('--ui=')) {
      if (uiSpecified)
        throw new Error('UI 组件库只能指定一次')
      uiSpecified = true
      options.ui = arg.slice('--ui='.length)
    }
    else if (arg.startsWith('--http=')) {
      if (httpSpecified)
        throw new Error('HTTP 请求库只能指定一次')
      httpSpecified = true
      options.http = arg.slice('--http='.length)
    }
    else if (arg === '--install') {
      options.install = true
    }
    else if (arg.startsWith('-')) {
      throw new Error(`未知参数：${arg}`)
    }
    else {
      locations.push(arg)
    }
  }
  if (locations.length > 1)
    throw new Error('只能指定一个创建目录')
  options.location = locations[0] || '.'
  return { options: normalizeOptions(options), yes }
}
