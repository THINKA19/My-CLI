/**
 * 脚手架选项定义与校验模块
 *
 * 作用：
 *   1. 定义所有可选项的字典：语言、代码检查、内容增强、部署目标、镜像仓库。
 *   2. normalizeOptions：把用户输入（命令行或交互问答）整理成完整选项，
 *      补默认值，并校验选项之间的依赖关系。
 *   3. 包名工具：根据目录名生成合法包名、校验包名是否符合 npm 规范。
 *   4. workspace 检测与环境校验：发现项目位于 monorepo 内时，
 *      阻止生成应由仓库根目录统一管理的配置（CI、Git hooks、Docker 等）。
 *
 * 约定：
 *   本模块只做读取和校验，不写任何文件，也不修改上级仓库。
 *   所有校验失败都抛出带中文说明的 Error，由 bin 入口统一展示。
 */
import fs from 'node:fs'
import path from 'node:path'

// ---------------------------------------------------------------------------
// 选项字典
// ---------------------------------------------------------------------------

export const languages = {
  zh: { label: '简体中文', lang: 'zh-CN' },
  en: { label: 'English', lang: 'en-US' },
  vi: { label: 'Tiếng Việt', lang: 'vi-VN' },
}
export const features = { 'eslint': 'ESLint 代码检查', 'git-hooks': 'Git 提交检查', 'ci': 'GitHub Actions CI' }
export const enhancements = { 'mermaid': 'Mermaid 图表（流程图、时序图等）', 'image-zoom': '图片放大', 'reading-progress': '文章阅读进度' }
export const targets = {
  'github-pages': 'GitHub Pages',
  'vercel': 'Vercel',
  'cloudflare': 'Cloudflare Pages',
  'oss': '阿里云 OSS',
  'cos': '腾讯云 COS',
  'server': '自有服务器',
}
export const registries = { aliyun: '阿里云 ACR', tencent: '腾讯云 TCR', dockerhub: 'Docker Hub' }

// ---------------------------------------------------------------------------
// 选项归一化与校验
// ---------------------------------------------------------------------------

// 校验数组中的每一项都在字典里，并去重；出现未知选项时抛错
function selection(values, choices, label) {
  if (!Array.isArray(values) || values.some(value => !Object.hasOwn(choices, value)))
    throw new Error(`${label}包含未知选项`)
  return [...new Set(values)]
}

/**
 * 把原始输入整理成完整的选项对象：补默认值、过滤非法项，并校验选项间的依赖。
 * 校验顺序决定了同时存在多个问题时用户先看到哪条提示，请勿随意调整。
 */
export function normalizeOptions(input = {}) {
  const options = {
    location: input.location?.trim() || '.',
    i18n: Boolean(input.i18n),
    languages: selection(input.languages ?? ['zh'], languages, '语言'),
    defaultLanguage: input.defaultLanguage ?? input.languages?.[0] ?? 'zh',
    features: selection(input.features ?? [], features, '代码检查'),
    enhancements: selection(input.enhancements ?? [], enhancements, '内容增强'),
    targets: selection(input.targets ?? [], targets, '部署目标'),
    docker: Boolean(input.docker),
    automation: selection(input.automation ?? [], targets, '自动部署目标'),
    registries: selection(input.registries ?? [], registries, '镜像仓库'),
    install: Boolean(input.install),
    packageName: input.packageName,
  }

  // 多语言至少两种语言，单语言只能一种
  if (options.i18n ? options.languages.length < 2 : options.languages.length !== 1)
    throw new Error(options.i18n ? '国际化至少需要选择两种语言' : '单语言站点只能选择一种语言')

  if (!options.languages.includes(options.defaultLanguage))
    throw new Error('默认语言必须属于已选语言')

  if (options.automation.some(target => !options.targets.includes(target)))
    throw new Error('自动部署目标必须属于已选部署目标')

  // 自有服务器：强制启用 Docker，并要求自动部署和镜像仓库
  if (options.targets.includes('server')) {
    options.docker = true
    if (!options.automation.includes('server'))
      throw new Error('当前自有服务器仅支持现有 GitHub Actions Docker 部署')
    if (!options.registries.length)
      throw new Error('自有服务器部署需要至少选择一个镜像仓库')
  }

  if (options.registries.length && !options.docker)
    throw new Error('发布镜像需要启用 Docker')

  // GitHub Pages 只有 Actions 工作流这一种适配
  if (options.targets.includes('github-pages') && !options.automation.includes('github-pages'))
    throw new Error('当前 GitHub Pages 适配使用现有 GitHub Actions 工作流')

  return options
}

// ---------------------------------------------------------------------------
// 包名
// ---------------------------------------------------------------------------

/** 由目录名生成合法包名：转小写，非法字符替换为连字符，去掉开头的非字母数字 */
export function packageNameFor(directory) {
  return path.basename(directory).toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^[^a-z0-9]+/, '') || 'my-docs'
}

/** 校验包名是否符合 npm 规范：长度不超过 214，可带 @scope/ 前缀 */
export function validPackageName(value) {
  return typeof value === 'string' && value.length <= 214 && /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(value)
}

// ---------------------------------------------------------------------------
// workspace 检测与环境校验
// ---------------------------------------------------------------------------

/**
 * 从目标目录的上一级开始逐级向上查找 monorepo 根目录。
 * 返回 { root, kind } 或 undefined；kind 为 'pnpm' 或 'other'（npm/yarn workspaces）。
 * 只读取，绝不修改上级仓库。无法解析的 package.json 视为与 workspace 无关并跳过，
 * 避免用户主目录等位置的损坏文件导致 CLI 崩溃。
 */
export function findWorkspace(target) {
  let directory = path.dirname(path.resolve(target))
  while (true) {
    if (fs.existsSync(path.join(directory, 'pnpm-workspace.yaml')))
      return { root: directory, kind: 'pnpm' }

    const pkgFile = path.join(directory, 'package.json')
    if (fs.existsSync(pkgFile)) {
      try {
        if (JSON.parse(fs.readFileSync(pkgFile, 'utf8')).workspaces)
          return { root: directory, kind: 'other' }
      }
      catch {
        // 无法解析的 package.json，忽略并继续向上查找
      }
    }

    const parent = path.dirname(directory)
    if (parent === directory)
      return undefined
    directory = parent
  }
}

/**
 * 校验选项与运行环境是否冲突，返回检测到的 workspace（没有则为 undefined）。
 * 在 monorepo 子项目里，CI、Git hooks、Docker 等应由仓库根目录统一接入，
 * 这里直接拒绝生成，避免干扰根目录的现有规则。
 */
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
