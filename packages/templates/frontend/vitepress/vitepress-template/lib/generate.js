import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { languages, normalizeOptions, packageNameFor, targets, validateEnvironment, validPackageName } from './options.js'

const templates = fileURLToPath(new URL('../templates/', import.meta.url))
const rename = { _gitignore: '.gitignore', _npmrc: '.npmrc', _dockerignore: '.dockerignore' }
const skip = new Set(['node_modules', 'dist', 'cache', '.git', '.DS_Store', '.npmignore', '.vercel', 'package-lock.json', 'yarn.lock'])

function mergePackage(target, source) {
  for (const [key, value] of Object.entries(source)) {
    target[key] = value && typeof value === 'object' && !Array.isArray(value)
      ? { ...target[key], ...value }
      : value
  }
}

// Keep existing resolved versions, but remove unselected direct importer entries.
// pnpm 11 stores its package-manager lock and project lock as separate YAML documents.
export function selectLockfile(source, pkg) {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const output = []
  let section
  let keep = true
  let importers = false
  for (const line of lines) {
    if (/^\S/.test(line)) {
      importers = line === 'importers:'
      section = undefined
      keep = true
    }
    const group = importers && line.match(/^ {4}(dependencies|devDependencies):$/)
    if (group) {
      section = group[1]
      keep = true
    }
    else if (section && line.trim() && !line.startsWith('      ')) {
      section = undefined
      keep = true
    }
    if (section) {
      const entry = line.match(/^ {6}(.+):$/)
      if (entry) {
        const name = entry[1].replace(/^['"]|['"]$/g, '')
        keep = Object.hasOwn(pkg[section] || {}, name)
      }
    }
    if (keep)
      output.push(line)
  }
  return output.join('\n')
}

export function createPlan(input = {}, cwd = process.cwd()) {
  const options = normalizeOptions(input)
  const target = path.resolve(cwd, options.location)
  const workspace = validateEnvironment(options, target)
  const packageName = options.packageName || packageNameFor(target)
  if (!validPackageName(packageName))
    throw new Error('包名不合法，请使用小写字母、数字、点、下划线和连字符，可带 @scope/')
  const files = new Map()
  const modules = []
  const pkg = {}
  const put = (relative, content) => files.set(relative, Buffer.isBuffer(content) ? content : Buffer.from(content))
  const text = relative => files.get(relative).toString('utf8').replace(/\r\n/g, '\n')
  const read = (module, relative) => fs.readFileSync(path.join(templates, module, relative), 'utf8').replace(/\r\n/g, '\n')
  const add = (module, transform = value => value) => {
    modules.push(module)
    const walk = (directory, prefix = '') => {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (skip.has(entry.name))
          continue
        const relative = prefix ? `${prefix}/${entry.name}` : entry.name
        if (relative === '.vitepress/config/generated')
          continue
        const source = path.join(directory, entry.name)
        if (entry.isSymbolicLink())
          throw new Error(`模板不支持符号链接：${source}`)
        if (entry.isDirectory()) {
          walk(source, relative)
          continue
        }
        if (relative === 'package.fragment.json' || relative === 'package.json') {
          mergePackage(pkg, JSON.parse(fs.readFileSync(source, 'utf8')))
          continue
        }
        if (relative.endsWith('.fragment.txt'))
          continue
        const destination = transform(relative.split('/').map(part => rename[part] || part).join('/'))
        put(destination, fs.readFileSync(source))
      }
    }
    walk(path.join(templates, module))
  }
  add('base')
  for (const code of options.languages) {
    add(`internationalization/languages/${code}`, relative => options.i18n ? relative : relative.replace(`src/${code}/`, 'src/'))
  }
  add(options.i18n ? 'internationalization/multiple' : 'internationalization/single')
  const registry = Object.fromEntries(options.languages.map(code => [code, {
    configKey: code === options.defaultLanguage ? 'root' : code,
    ...languages[code],
    prefix: options.i18n ? `/${code}/` : '/',
    sourceDir: options.i18n ? code : '',
    fallback: options.defaultLanguage,
  }]))
  put('.vitepress/config/menu/registry.ts', `export const languages = ${JSON.stringify(registry, null, 2)} as const\n`)
  const render = (source, replacements) => {
    let content = text(source)
    for (const [key, value] of Object.entries(replacements)) content = content.replaceAll(key, value)
    put(source.slice(0, -4), content)
    files.delete(source)
  }
  render('.vitepress/config/menu/index.ts.tpl', {
    __LOCALE_IMPORTS__: options.languages.map(code => `import { ${code} } from '#config/locales/${code}/index'`).join('\n'),
    __LOCALE_TEXTS__: `{ ${options.languages.join(', ')} }`,
  })
  render('.vitepress/config/search.ts.tpl', {
    __SEARCH_IMPORTS__: options.languages.map(code => `import { search as ${code} } from '#config/locales/${code}/search'`).join('\n'),
    __SEARCH_TEXTS__: `{ ${options.languages.join(', ')} }`,
    __SEARCH_OPTIONS__: options.i18n
      ? `    locales: Object.fromEntries(Object.entries(languages).map(([code, locale]) => [locale.configKey, { translations: translations[code as Language] }])),`
      : `    translations: translations.${options.defaultLanguage},`,
  })
  if (!options.i18n) {
    put('.vitepress/config/search.ts', text('.vitepress/config/search.ts').replace('import { languages } from \'#config/menu/registry\'\n', ''))
    for (const [relative] of files) {
      if (relative.startsWith('src/') && relative.endsWith('.md'))
        put(relative, text(relative).replaceAll(`/${options.defaultLanguage}/`, '/'))
    }
    // Preserve translated page content; replace only the multilingual showcase feature.
    const showcase = {
      zh: ['多语言', '提供中文、英文和越南文版本。', '文档导航', '根据文档自动生成导航与侧边栏。'],
      en: ['Multiple Languages', 'Chinese, English and Vietnamese versions.', 'Documentation navigation', 'Navigation and sidebars generated from your documents.'],
      vi: ['Đa ngôn ngữ', 'Có phiên bản tiếng Trung, tiếng Anh và tiếng Việt.', 'Điều hướng tài liệu', 'Tự động tạo điều hướng và thanh bên từ tài liệu.'],
    }[options.defaultLanguage]
    put('src/index.md', text('src/index.md').replace(showcase[0], showcase[2]).replace(showcase[1], showcase[3]))
  }
  else {
    put('.vitepress/config/site.ts', text('.vitepress/config/site.ts').replace('import { loadEnv } from \'vite\'', 'import { loadEnv } from \'vite\'\nimport { transformSitemapItems } from \'./sitemap.ts\'').replace('sitemap: { hostname: siteUrl }', 'sitemap: { hostname: siteUrl, transformItems: transformSitemapItems }'))
  }
  let config = text('.vitepress/config.ts')
  if (!options.i18n)
    config = config.replace('    ...themeConfig,', '    ...themeConfig,\n    ...languageConfig.themeConfig,')
  for (const feature of options.features) add(`features/${feature}`)
  if (options.features.includes('git-hooks') && options.features.includes('eslint'))
    add('features/git-hooks-with-eslint')
  for (const enhancement of options.enhancements) add(`enhancements/${enhancement}`)
  if (options.enhancements.includes('mermaid')) {
    config = config.replace(/\}\)\s*$/, `${read('enhancements/mermaid', 'markdown.fragment.txt')}})\n`)
    put('.vitepress/config/site.ts', text('.vitepress/config/site.ts').replace('    publicDir: \'../public\',', '    publicDir: \'../public\',\n    optimizeDeps: { include: [\'mermaid\'] },'))
  }
  put('.vitepress/config.ts', config)
  if (options.targets.length || options.docker)
    add('deploy/shared')
  if (options.docker)
    add('features/docker')
  for (const target of options.targets) {
    add(`deploy/${target}`)
    if (!options.automation.includes(target)) {
      for (const relative of files.keys()) {
        if (relative.startsWith('.github/workflows/')) {
          // Remove only the current adapter's workflow; other selected targets stay intact.
          const adapterPath = path.join(templates, `deploy/${target}`, relative)
          if (fs.existsSync(adapterPath))
            files.delete(relative)
        }
      }
    }
  }
  if (options.registries.length) {
    add('deploy/registry')
    if (!options.targets.includes('server')) {
      const relative = '.github/workflows/docker-cloud.yml'
      put(relative, text(relative).replace(/\n {2}# -+\n {2}# Job 3:[\s\S]*$/, '\n'))
    }
  }
  if (options.features.includes('ci') && !options.features.includes('eslint')) {
    const relative = '.github/workflows/ci.yml'
    put(relative, text(relative).replace(/ {6}# Step 6:[\s\S]*?(?= {6}# Step 7:)/, ''))
  }
  pkg.name = packageName
  for (const key of ['dependencies', 'devDependencies']) {
    if (pkg[key])
      pkg[key] = Object.fromEntries(Object.entries(pkg[key]).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0))
  }
  if (workspace) {
    delete pkg.devEngines
    delete pkg.scripts.preinstall
    files.delete('pnpm-workspace.yaml')
    files.delete('.npmrc')
  }
  else {
    put('pnpm-lock.yaml', selectLockfile(read('lock', 'pnpm-lock.yaml'), pkg))
  }
  put('package.json', `${JSON.stringify(pkg, null, 2)}\n`)
  put('README.md', projectReadme(options, pkg, workspace))
  if (options.targets.length || options.registries.length)
    put('DEPLOYMENT.md', deploymentReadme(options))
  return { target, options, workspace, packageName, files, modules }
}

function projectReadme(options, pkg, workspace) {
  const commands = Object.keys(pkg.scripts).filter(key => !['preinstall', 'prepare'].includes(key))
  return `# ${pkg.name}\n\nVitePress 文档站点。\n\n- 国际化：${options.i18n ? '启用' : '关闭'}\n- 语言：${options.languages.map(code => languages[code].label).join('、')}\n- 默认语言：${languages[options.defaultLanguage].label}\n- 代码检查：${options.features.join('、') || '无'}\n- 内容增强：${options.enhancements.join('、') || '无'}\n- 部署目标：${options.targets.map(target => targets[target]).join('、') || '无'}\n- Docker：${options.docker ? '包含' : '不包含'}\n\n## 开发\n\n使用 Node.js 24 和 pnpm 11。${workspace ? '\n\n依赖由 workspace 根目录管理；请确认当前路径已包含在根目录 packages 范围中。不要为子项目创建独立锁文件。\n\n在仓库根目录安装依赖，然后进入当前项目运行命令。' : '\n\n先运行 `pnpm install`，将生成的锁文件一并提交。'}\n\n\`\`\`sh\npnpm dev\npnpm build\npnpm preview\n\`\`\`\n\n构建产物位于 \`dist/\`。${options.docker ? '\n\nDocker 用法见 [docker/README.md](docker/README.md)。构建前先安装依赖并提交匹配的锁文件。' : ''}${options.targets.length || options.registries.length ? '\n\n部署配置与凭据说明见 [DEPLOYMENT.md](DEPLOYMENT.md)。' : ''}\n\n## 可用命令\n\n${commands.map(key => `- \`pnpm ${key}\``).join('\n')}\n\n菜单生成规则见 [scripts/menus/README.md](scripts/menus/README.md)。\n`
}

function deploymentReadme(options) {
  const specs = {
    'github-pages': ['PAGES_ENABLED=true', '仓库 Settings → Pages 选择 GitHub Actions；手动运行 release 工作流也可发布。'],
    'vercel': ['VERCEL_ENABLED=true', 'Vars: VERCEL_SITE_URL；Secrets: VERCEL_TOKEN、VERCEL_ORG_ID、VERCEL_PROJECT_ID。'],
    'cloudflare': ['CLOUDFLARE_ENABLED=true', 'Vars: CLOUDFLARE_SITE_URL、CLOUDFLARE_PROJECT_NAME；Secrets: CLOUDFLARE_API_TOKEN、CLOUDFLARE_ACCOUNT_ID。'],
    'oss': ['OSS_ENABLED=true', 'Vars: OSS_SITE_URL、OSS_REGION、OSS_BUCKET；Secrets: OSS_ACCESS_KEY_ID、OSS_ACCESS_KEY_SECRET。'],
    'cos': ['COS_ENABLED=true', 'Vars: COS_SITE_URL、COS_REGION、COS_BUCKET；Secrets: COS_SECRET_ID、COS_SECRET_KEY。'],
    'server': ['SERVER_DEPLOY_ENABLED=true', 'Vars: SERVER_IMAGE、SERVER_REGISTRY，可选 SERVER_PORT；Secrets: SERVER_HOST、SERVER_USER、SERVER_SSH_KEY、SERVER_FINGERPRINT、SERVER_REGISTRY_USERNAME、SERVER_REGISTRY_PASSWORD。SERVER_IMAGE 必须对应已启用的镜像目标。'],
  }
  const entries = options.targets.map((target) => {
    const [flag, details] = specs[target]
    return `## ${targets[target]}\n\n${options.automation.includes(target) ? `使用现有 GitHub Actions 工作流。自动触发需设置仓库变量 \`${flag}\`；手动运行规则沿用现有工作流。\n\n${details}` : '仅生成现有平台脚本及配置说明，不生成 GitHub Actions 部署工作流。'}${!options.automation.includes(target) && ['oss', 'cos'].includes(target) ? `\n\n本地设置对应环境变量（${details}），然后运行 \`pnpm deploy:${target}\`；本地变量名与上述 Vars/Secrets 同名。` : ''}${target === 'vercel' && !options.automation.includes(target) ? '\n\n设置 VITE_BASE、VITE_SITE_URL，运行 `pnpm deploy:vercel:prepare`，再通过 Vercel CLI 发布 `.vercel/output`。' : ''}${target === 'cloudflare' && !options.automation.includes(target) ? '\n\n在 Cloudflare Pages 连接 Git 仓库；构建命令 `pnpm build`，输出目录 `dist`，配置生产域名 VITE_SITE_URL 和 VITE_BASE。不要同时启用另一套自动发布。' : ''}`
  })
  if (options.registries.length)
    entries.push(`## 镜像发布\n\n生成 docker-cloud 工作流。仅启用下列选中的仓库变量，其他目标保持关闭：\n\n${options.registries.map(value => ({ aliyun: '- ALIYUN_DOCKER_ENABLED=true；Vars: ALIYUN_ACR_REGISTRY、ALIYUN_DOCKER_IMAGE、ALIYUN_SITE_URL、ALIYUN_BASE；Secrets: ALIYUN_REGISTRY_USERNAME、ALIYUN_REGISTRY_PASSWORD。', tencent: '- TENCENT_DOCKER_ENABLED=true；Vars: TENCENT_CCR_REGISTRY、TENCENT_DOCKER_IMAGE、TENCENT_SITE_URL、TENCENT_BASE；Secrets: TENCENT_REGISTRY_USERNAME、TENCENT_REGISTRY_PASSWORD。', dockerhub: '- DOCKERHUB_ENABLED=true；Vars: DOCKERHUB_IMAGE、DOCKERHUB_SITE_URL、DOCKERHUB_BASE；Secrets: DOCKERHUB_USERNAME、DOCKERHUB_TOKEN。' })[value]).join('\n')}`)
  return `# 部署说明\n\n仅生成配置，不立即部署。部署构建使用 \`VITE_BASE\` 和 \`VITE_SITE_URL\`；执行 \`pnpm build:deploy\` 前需设置完整站点地址。CI、Docker 和部署使用冻结安装，提交前先执行 \`pnpm install\` 并提交匹配的锁文件。\n\n${entries.join('\n\n')}\n`
}

export function assertTarget(plan) {
  // Inspect every ancestor: an existing symlink must never redirect writes elsewhere.
  let directory = plan.target
  while (true) {
    if (fs.existsSync(directory)) {
      const stat = fs.lstatSync(directory)
      if (stat.isSymbolicLink() || !stat.isDirectory())
        throw new Error(`目标路径不是普通目录：${directory}`)
    }
    const parent = path.dirname(directory)
    if (parent === directory)
      break
    directory = parent
  }
  if (fs.existsSync(plan.target)) {
    const entries = fs.readdirSync(plan.target).filter(name => !['.git', '.DS_Store'].includes(name))
    if (entries.length)
      throw new Error(`目录不为空：${plan.target}。为避免覆盖已有文件，请使用空目录（允许保留 .git）`)
  }
}

export function writePlan(plan) {
  assertTarget(plan)
  fs.mkdirSync(plan.target, { recursive: true })
  for (const [relative, content] of plan.files) {
    const file = path.resolve(plan.target, relative)
    if (!file.startsWith(plan.target + path.sep))
      throw new Error(`文件超出目标目录：${relative}`)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, content, { flag: 'wx' })
  }
  fs.mkdirSync(path.join(plan.target, '.vitepress/config/generated'), { recursive: true })
  return plan.target
}
