import fs from 'node:fs'
import path from 'node:path'

export const languages = {
  zh: { label: '简体中文', lang: 'zh-CN' },
  en: { label: 'English', lang: 'en-US' },
  vi: { label: 'Tiếng Việt', lang: 'vi-VN' },
}
export const features = { 'eslint': 'ESLint 代码检查', 'git-hooks': 'Git 提交检查', 'ci': 'GitHub Actions CI' }
export const enhancements = { mermaid: 'Mermaid 图表（流程图、时序图等）' }
export const targets = {
  'github-pages': 'GitHub Pages',
  'vercel': 'Vercel',
  'cloudflare': 'Cloudflare Pages',
  'oss': '阿里云 OSS',
  'cos': '腾讯云 COS',
  'server': '自有服务器',
}
export const registries = { aliyun: '阿里云 ACR', tencent: '腾讯云 TCR', dockerhub: 'Docker Hub' }

function selection(values, choices, label) {
  if (!Array.isArray(values) || values.some(value => !Object.hasOwn(choices, value)))
    throw new Error(`${label}包含未知选项`)
  return [...new Set(values)]
}

export function normalizeOptions(input = {}) {
  const options = {
    location: input.location?.trim() || '.',
    i18n: input.i18n ?? false,
    languages: selection(input.languages ?? ['zh'], languages, '语言'),
    defaultLanguage: input.defaultLanguage ?? input.languages?.[0] ?? 'zh',
    features: selection(input.features ?? [], features, '代码检查'),
    enhancements: selection(input.enhancements ?? [], enhancements, '内容增强'),
    targets: selection(input.targets ?? [], targets, '部署目标'),
    docker: input.docker ?? false,
    automation: selection(input.automation ?? [], targets, '自动部署目标'),
    registries: selection(input.registries ?? [], registries, '镜像仓库'),
    install: input.install ?? false,
    packageName: input.packageName,
  }
  if (options.i18n ? options.languages.length < 2 : options.languages.length !== 1)
    throw new Error(options.i18n ? '国际化至少需要选择两种语言' : '单语言站点只能选择一种语言')
  if (!options.languages.includes(options.defaultLanguage))
    throw new Error('默认语言必须属于已选语言')
  if (options.automation.some(target => !options.targets.includes(target)))
    throw new Error('自动部署目标必须属于已选部署目标')
  if (options.targets.includes('server')) {
    options.docker = true
    if (!options.automation.includes('server'))
      throw new Error('当前自有服务器仅支持现有 GitHub Actions Docker 部署')
    if (!options.registries.length)
      throw new Error('自有服务器部署需要至少选择一个镜像仓库')
  }
  if (options.registries.length && !options.docker)
    throw new Error('发布镜像需要启用 Docker')
  if (options.targets.includes('github-pages') && !options.automation.includes('github-pages'))
    throw new Error('当前 GitHub Pages 适配使用现有 GitHub Actions 工作流')
  return options
}

export function packageNameFor(directory) {
  return path.basename(directory).toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^[^a-z0-9]+/, '') || 'my-docs'
}

export function validPackageName(value) {
  return typeof value === 'string' && value.length <= 214 && /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(value)
}

// Workspace integration stays read-only: never rewrite a parent repository.
export function findWorkspace(target) {
  let directory = path.dirname(path.resolve(target))
  while (true) {
    const file = path.join(directory, 'pnpm-workspace.yaml')
    if (fs.existsSync(file))
      return { root: directory, kind: 'pnpm' }
    const pkg = path.join(directory, 'package.json')
    if (fs.existsSync(pkg)) {
      const data = JSON.parse(fs.readFileSync(pkg, 'utf8'))
      if (data.workspaces)
        return { root: directory, kind: 'other' }
    }
    const parent = path.dirname(directory)
    if (parent === directory)
      return undefined
    directory = parent
  }
}

export function validateEnvironment(options, target) {
  const workspace = findWorkspace(target)
  if (workspace?.kind === 'other')
    throw new Error('当前版本沿用 pnpm；检测到其他 workspace，请使用 pnpm workspace 或独立目标目录')
  if (workspace && (options.features.includes('ci') || options.features.includes('git-hooks') || options.automation.length || options.registries.length))
    throw new Error('检测到已有 workspace：Git hooks 和 GitHub Actions 应在仓库根目录管理，请取消这些选项；根目录配置不会被自动修改')
  if (workspace && options.docker)
    throw new Error('现有 Dockerfile 使用独立项目作为构建上下文；workspace 子项目请由根目录管理 Docker 构建')
  return workspace
}
