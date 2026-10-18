import fs from 'node:fs'
import path from 'node:path'

export { platforms, validate } from '../templates/features/deploy/shared/scripts/deploy/check-config.js'
export function normalizeOptions(input = {}) {
  return { location: input.location || '.', docker: Boolean(input.docker), deploy: Boolean(input.deploy), install: Boolean(input.install), targets: input.targets || [] }
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

export const help = `用法：create-monorepo-template [目录] [选项]
  --yes, -y             非交互创建
  --docker              包含 Docker 示例
  --deploy              启用部署目标管理（--cd 兼容别名）
  --deploy-config=文件   初始目标配置，可重复
  --install             安装依赖
  --help, -h            帮助
  deploy add|list|edit|remove|run  管理当前仓库目标
`
export function parseArgs(args) {
  if (args.includes('--help') || args.includes('-h'))
    return { help: true }
  const options = normalizeOptions()
  const locations = []
  let yes = false
  for (const arg of args) {
    if (arg.startsWith('--deploy-config=')) {
      options.targets.push(JSON.parse(fs.readFileSync(path.resolve(arg.slice('--deploy-config='.length)), 'utf8')))
      options.deploy = true
    }
    else if (['--yes', '-y'].includes(arg)) {
      yes = true
    }
    else if (arg === '--docker') {
      options.docker = true
    }
    else if (['--deploy', '--cd'].includes(arg)) {
      options.deploy = true
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
  return { options, yes }
}
