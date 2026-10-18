import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { enable, saveTarget } from './deploy/targets.js'
import { dockerPlan } from './docker/generate.js'
import { assertTarget, normalizeOptions, validate } from './options.js'

const templateDir = fileURLToPath(new URL('../templates/', import.meta.url))
const skip = new Set(['node_modules', 'dist', '.npmignore', '.git', '.DS_Store', 'pnpm-lock.yaml', '.turbo'])
const rename = { _gitignore: '.gitignore', _npmrc: '.npmrc', _dockerignore: '.dockerignore' }
export function createPlan(input = {}, cwd = process.cwd()) {
  const options = normalizeOptions(input)
  const { docker, deploy, targets: initial } = options
  const target = path.resolve(cwd, options.location)
  const name = path.basename(target)
  if (!/^[a-z0-9][\w.-]*$/i.test(name))
    throw new Error('项目名不合法')
  assertTarget(target)
  for (const t of initial) validate(target, t)
  if (new Set(initial.map(t => t.name)).size !== initial.length)
    throw new Error('初始目标名称重复')
  if (initial.filter(t => t.platform === 'github-pages').length > 1)
    throw new Error('每仓库只允许一个 Pages 目标')
  // Assemble the complete selection before creating project files.
  const files = new Map()
  let pkg
  function add(directory, relative = '', base = false) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (skip.has(entry.name) || (base && !relative && entry.name === 'features'))
        continue
      const source = path.join(directory, entry.name)
      if (entry.isSymbolicLink())
        throw new Error(`模板不支持符号链接：${source}`)
      const destination = path.join(relative, rename[entry.name] || entry.name)
      if (entry.isDirectory()) {
        add(source, destination, base)
      }
      else if (entry.name === 'package.fragment.json') {
        const fragment = JSON.parse(fs.readFileSync(source, 'utf8'))
        pkg.scripts = { ...pkg.scripts, ...fragment.scripts }
      }
      else if (destination === 'package.json') {
        pkg = JSON.parse(fs.readFileSync(source, 'utf8'))
      }
      else {
        files.set(destination, fs.readFileSync(source))
      }
    }
  }
  add(path.join(templateDir, 'base'), '', true)
  const containers = dockerPlan(target, docker, name)
  for (const [relative, content] of containers.files) files.set(relative, content)
  pkg.scripts = { ...pkg.scripts, ...containers.scripts }

  pkg.name = name
  files.set('package.json', `${JSON.stringify(pkg, null, 2)}\n`)
  files.set('README.md', `${files.get('README.md')}\n## 本次生成的可选配置\n\n${docker.features.length ? '- Docker 配置已包含：见 docker/README.md，应用由项目自行实现。' : '- 未启用 Docker。'}\n${deploy ? '- 部署管理已包含：部署目标管理，可运行 pnpm run deploy add；见 deploy/README.md。' : '- 未启用部署配置。'}\n`)
  files.set('.github/README.md', `# GitHub 自动化\n\n默认 CI 执行 Lint、类型检查和构建。首次安装后请提交根 pnpm-lock.yaml，供冻结安装使用。\n\n${deploy ? '使用 pnpm run deploy add 添加目标，每个目标生成独立手动工作流；Secrets 放对应 GitHub Environment。' : '本次未生成 CD 工作流，仅包含 CI。'}\n`)

  return { target, options, files }
}
export function writePlan(plan) {
  const { target, files, options } = plan
  assertTarget(target)
  for (const [relative, content] of files) {
    const file = path.join(target, relative)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, content)
  }
  if (options.deploy) {
    enable(target)
    for (const t of options.targets) saveTarget(target, t)
  }
  return target
}
