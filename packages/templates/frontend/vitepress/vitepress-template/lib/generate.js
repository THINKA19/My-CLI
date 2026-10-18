/**
 * 项目创建计划生成与落盘模块
 *
 * 作用：
 *   createPlan   根据用户选项，在内存里拼出要生成的全部文件（files）和 package.json（pkg），
 *                不写磁盘，因此可以先展示摘要、校验，再决定是否真正创建。
 *   assertTarget 落盘前的安全检查：目标及其所有上级目录不得是符号链接，目标目录必须为空。
 *   writePlan    把 createPlan 的结果一次性写入磁盘。
 *   selectLockfile 按已选依赖裁剪 pnpm-lock.yaml 模板。
 *
 * 生成流程（createPlan）：
 *   base 基础模板 -> 语言模板 -> 单/多语言模板 -> 渲染 .tpl
 *   -> 按选项叠加 features / enhancements / deploy / docker 模板
 *   -> 合并 package.json、裁剪锁文件 -> 生成 README 与 DEPLOYMENT.md
 *
 * 模板约定（templates/<模块>/ 下）：
 *   package.json / package.fragment.json   合并进最终 package.json，不作为文件输出
 *   .fragment.txt                         仅供生成器读取的代码片段，不输出
 *   .tpl                                  渲染后去掉 .tpl 后缀输出
 *   _gitignore / _npmrc / _dockerignore    输出时改名为带点的文件（避免 npm 发布时被忽略）
 *
 * 注意：
 *   生成器通过字符串替换修改部分模板文件。找不到替换目标时会直接报错，
 *   而不是静默跳过——这通常说明模板被改动过，需要同步更新本文件。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { languages, normalizeOptions, packageNameFor, targets, validateEnvironment, validPackageName } from './options.js'

const templates = fileURLToPath(new URL('../templates/', import.meta.url))
const rename = { _gitignore: '.gitignore', _npmrc: '.npmrc', _dockerignore: '.dockerignore' }
const skip = new Set(['node_modules', 'dist', 'cache', '.git', '.DS_Store', '.npmignore', '.vercel', 'package-lock.json', 'yarn.lock'])

// 菜单生成目录：模板里不带，创建后留空目录供生成脚本写入
const GENERATED_DIR = '.vitepress/config/generated'

// ---------------------------------------------------------------------------
// 通用工具
// ---------------------------------------------------------------------------

// 合并 package.json 片段：对象类字段（scripts、dependencies 等）浅合并，其余直接覆盖
function mergePackage(target, source) {
  for (const [key, value] of Object.entries(source)) {
    target[key] = value && typeof value === 'object' && !Array.isArray(value)
      ? { ...target[key], ...value }
      : value
  }
}

// 只替换第一处匹配，找不到则报错。
// 替换内容用函数返回，避免其中的 $&、$' 等被 String.replace 当成特殊占位符。
function replaceOnce(content, search, replacement, label) {
  const found = typeof search === 'string' ? content.includes(search) : search.test(content)
  if (!found)
    throw new Error(`模板与生成器不一致：${label} 中找不到 ${search}`)
  return content.replace(search, () => replacement)
}

/**
 * 按已选依赖裁剪 pnpm-lock.yaml 模板。
 * 保留已解析的版本信息，只删除 importers 下未被选中的直接依赖条目。
 * pnpm 11 的锁文件由"包管理器锁"和"项目锁"两个 YAML 文档组成，这里逐行处理，
 * 依赖固定的缩进格式（importers 下依赖名缩进 6 个空格）。
 */
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

// ---------------------------------------------------------------------------
// 创建计划
// ---------------------------------------------------------------------------

/**
 * 根据选项生成创建计划，不写磁盘。
 * 返回 { target, options, workspace, packageName, files, modules }：
 *   files   Map<相对路径, Buffer>，所有要写入的文件
 *   modules 实际叠加过的模板模块名，便于调试和测试
 */
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
  // 修改已生成的文件：只替换第一处，找不到会报错
  const edit = (relative, search, replacement) => put(relative, replaceOnce(text(relative), search, replacement, relative))

  // 叠加一个模板模块：遍历目录，合并 package 片段，其余文件加入 files。
  // transform 用于在输出前调整路径（语言模板在单语言模式下需要去掉语言目录）。
  const add = (module, transform = value => value) => {
    modules.push(module)
    const walk = (directory, prefix = '') => {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        if (skip.has(entry.name))
          continue
        const relative = prefix ? `${prefix}/${entry.name}` : entry.name
        if (relative === GENERATED_DIR)
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

  // 渲染 .tpl 文件：替换占位符后去掉 .tpl 后缀输出
  const render = (source, replacements) => {
    let content = text(source)
    for (const [key, value] of Object.entries(replacements))
      content = content.replaceAll(key, () => value)
    put(source.slice(0, -4), content)
    files.delete(source)
  }

  // --- 基础模板与国际化 -----------------------------------------------------
  add('base')
  for (const code of options.languages)
    add(`internationalization/languages/${code}`, relative => options.i18n ? relative : relative.replace(`src/${code}/`, 'src/'))
  add(options.i18n ? 'internationalization/multiple' : 'internationalization/single')

  const registry = Object.fromEntries(options.languages.map(code => [code, {
    configKey: code === options.defaultLanguage ? 'root' : code,
    ...languages[code],
    prefix: options.i18n ? `/${code}/` : '/',
    sourceDir: options.i18n ? code : '',
    fallback: options.defaultLanguage,
  }]))
  put('.vitepress/config/menu/registry.ts', `export const languages = ${JSON.stringify(registry, null, 2)} as const\n`)

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
    // 单语言：把语言目录抹平，页面内链接去掉语言前缀
    edit('.vitepress/config/search.ts', 'import { languages } from \'#config/menu/registry\'\n', '')
    for (const [relative] of files) {
      if (relative.startsWith('src/') && relative.endsWith('.md'))
        put(relative, text(relative).replaceAll(`/${options.defaultLanguage}/`, '/'))
    }
    // 保留已翻译的页面内容，只把"多语言"卖点替换为"文档导航"
    const showcase = {
      zh: ['多语言', '提供中文、英文和越南文版本。', '文档导航', '根据文档自动生成导航与侧边栏。'],
      en: ['Multiple Languages', 'Chinese, English and Vietnamese versions.', 'Documentation navigation', 'Navigation and sidebars generated from your documents.'],
      vi: ['Đa ngôn ngữ', 'Có phiên bản tiếng Trung, tiếng Anh và tiếng Việt.', 'Điều hướng tài liệu', 'Tự động tạo điều hướng và thanh bên từ tài liệu.'],
    }[options.defaultLanguage]
    edit('src/index.md', showcase[0], showcase[2])
    edit('src/index.md', showcase[1], showcase[3])
  }
  else {
    // 多语言：sitemap 需要按语言转换条目
    edit('.vitepress/config/site.ts', 'import { loadEnv } from \'vite\'', 'import { loadEnv } from \'vite\'\nimport { transformSitemapItems } from \'./sitemap.ts\'')
    edit('.vitepress/config/site.ts', 'sitemap: { hostname: siteUrl }', 'sitemap: { hostname: siteUrl, transformItems: transformSitemapItems }')
  }

  let config = text('.vitepress/config.ts')
  if (!options.i18n)
    config = replaceOnce(config, '    ...themeConfig,', '    ...themeConfig,\n    ...languageConfig.themeConfig,', '.vitepress/config.ts')

  // --- 功能与增强 -----------------------------------------------------------
  for (const feature of options.features)
    add(`features/${feature}`)
  if (options.features.includes('git-hooks') && options.features.includes('eslint'))
    add('features/git-hooks-with-eslint')
  for (const enhancement of options.enhancements)
    add(`enhancements/${enhancement}`)
  if (options.enhancements.includes('mermaid')) {
    config = replaceOnce(config, /\}\)\s*$/, `${read('enhancements/mermaid', 'markdown.fragment.txt')}})\n`, '.vitepress/config.ts')
    edit('.vitepress/config/site.ts', '    publicDir: \'../public\',', '    publicDir: \'../public\',\n    optimizeDeps: { include: [\'mermaid\'] },')
  }
  // 基础主题统一接入增强，模块只提供自己的实现，不覆盖主题入口。
  const themeImports = []
  const themeSetup = []
  if (options.enhancements.includes('mermaid')) {
    themeImports.push('import { setupMermaid } from \'./enhancements/mermaid\'')
    themeSetup.push('setupMermaid()')
  }
  for (const [name, setup] of [['image-zoom', 'setupImageZoom'], ['reading-progress', 'setupReadingProgress']]) {
    if (options.enhancements.includes(name)) {
      themeImports.push(`import { ${setup} } from './enhancements/${name}'`)
      themeSetup.push(`${setup}()`)
    }
  }
  edit('.vitepress/theme/index.ts', '// __ENHANCEMENT_IMPORTS__', themeImports.join('\n'))
  edit('.vitepress/theme/index.ts', '    // __ENHANCEMENT_SETUP__', themeSetup.map(call => `    ${call}`).join('\n'))
  put('.vitepress/config.ts', config)

  // --- Docker 与部署 --------------------------------------------------------
  if (options.targets.length || options.docker)
    add('deploy/shared')
  if (options.docker)
    add('features/docker')
  for (const name of options.targets) {
    add(`deploy/${name}`)
    if (!options.automation.includes(name)) {
      // 未选自动部署：只删除当前适配器自带的工作流，其他目标的保持不动
      for (const relative of files.keys()) {
        if (relative.startsWith('.github/workflows/') && fs.existsSync(path.join(templates, `deploy/${name}`, relative)))
          files.delete(relative)
      }
    }
  }
  if (options.registries.length) {
    add('deploy/registry')
    if (!options.targets.includes('server'))
      edit('.github/workflows/docker-cloud.yml', /\n {2}# -+\n {2}# Job 3:[\s\S]*$/, '\n')
  }
  if (options.features.includes('ci') && !options.features.includes('eslint'))
    edit('.github/workflows/ci.yml', / {6}# Step 6:[\s\S]*?(?= {6}# Step 7:)/, '')

  // --- package.json 与锁文件 ------------------------------------------------
  pkg.name = packageName
  for (const key of ['dependencies', 'devDependencies']) {
    if (pkg[key])
      pkg[key] = Object.fromEntries(Object.entries(pkg[key]).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0))
  }

  if (workspace) {
    // 位于 monorepo 内：依赖和包管理配置由根目录管理，不生成独立锁文件
    delete pkg.devEngines
    delete pkg.scripts?.preinstall
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

// ---------------------------------------------------------------------------
// 文档生成：README.md
// ---------------------------------------------------------------------------

function projectReadme(options, pkg, workspace) {
  const commands = Object.keys(pkg.scripts ?? {}).filter(key => !['preinstall', 'prepare'].includes(key))
  const hasDeploy = options.targets.length || options.registries.length

  const summary = [
    `- 国际化：${options.i18n ? '启用' : '关闭'}`,
    `- 语言：${options.languages.map(code => languages[code].label).join('、')}`,
    `- 默认语言：${languages[options.defaultLanguage].label}`,
    `- 代码检查：${options.features.join('、') || '无'}`,
    `- 内容增强：${options.enhancements.join('、') || '无'}`,
    `- 部署目标：${options.targets.map(name => targets[name]).join('、') || '无'}`,
    `- Docker：${options.docker ? '包含' : '不包含'}`,
  ].join('\n')

  const install = workspace
    ? '依赖由 workspace 根目录管理；请确认当前路径已包含在根目录 packages 范围中。不要为子项目创建独立锁文件。\n\n在仓库根目录安装依赖，然后进入当前项目运行命令。'
    : '先运行 `pnpm install`，将生成的锁文件一并提交。'

  const sections = [
    `# ${pkg.name}`,
    'VitePress 文档站点。',
    summary,
    '## 开发',
    `使用 Node.js 24 和 pnpm 11。\n\n${install}`,
    '```sh\npnpm dev\npnpm build\npnpm preview\n```',
    '构建产物位于 `dist/`。',
  ]
  if (options.enhancements.includes('image-zoom'))
    sections.push('## 图片放大', '点击正文图片可放大；链接内图片不接管。为图片添加 `data-no-zoom` 属性可排除放大，例如 `<img src="/example.png" data-no-zoom>`。')
  if (options.enhancements.includes('reading-progress'))
    sections.push('## 阅读进度', '文章页顶部显示正文滚动进度，首页隐藏。短文章无需滚动时显示完成状态；该进度表示浏览位置。')
  if (options.docker)
    sections.push('Docker 用法见 [docker/README.md](docker/README.md)。构建前先安装依赖并提交匹配的锁文件。')
  if (hasDeploy)
    sections.push('部署配置与凭据说明见 [DEPLOYMENT.md](DEPLOYMENT.md)。')
  sections.push('## 可用命令', commands.map(key => `- \`pnpm ${key}\``).join('\n'), '菜单生成规则见 [scripts/menus/README.md](scripts/menus/README.md)。')

  return `${sections.join('\n\n')}\n`
}

// ---------------------------------------------------------------------------
// 文档生成：DEPLOYMENT.md
// ---------------------------------------------------------------------------

// 各部署目标的 [启用开关变量, 所需变量与密钥说明]
const DEPLOY_SPECS = {
  'github-pages': ['PAGES_ENABLED=true', '仓库 Settings → Pages 选择 GitHub Actions；手动运行 release 工作流也可发布。'],
  'vercel': ['VERCEL_ENABLED=true', 'Vars: VERCEL_SITE_URL；Secrets: VERCEL_TOKEN、VERCEL_ORG_ID、VERCEL_PROJECT_ID。'],
  'cloudflare': ['CLOUDFLARE_ENABLED=true', 'Vars: CLOUDFLARE_SITE_URL、CLOUDFLARE_PROJECT_NAME；Secrets: CLOUDFLARE_API_TOKEN、CLOUDFLARE_ACCOUNT_ID。'],
  'oss': ['OSS_ENABLED=true', 'Vars: OSS_SITE_URL、OSS_REGION、OSS_BUCKET；Secrets: OSS_ACCESS_KEY_ID、OSS_ACCESS_KEY_SECRET。'],
  'cos': ['COS_ENABLED=true', 'Vars: COS_SITE_URL、COS_REGION、COS_BUCKET；Secrets: COS_SECRET_ID、COS_SECRET_KEY。'],
  'server': ['SERVER_DEPLOY_ENABLED=true', 'Vars: SERVER_IMAGE、SERVER_REGISTRY，可选 SERVER_PORT；Secrets: SERVER_HOST、SERVER_USER、SERVER_SSH_KEY、SERVER_FINGERPRINT、SERVER_REGISTRY_USERNAME、SERVER_REGISTRY_PASSWORD。SERVER_IMAGE 必须对应已启用的镜像目标。'],
}

// 各镜像仓库的启用说明
const REGISTRY_SPECS = {
  aliyun: '- ALIYUN_DOCKER_ENABLED=true；Vars: ALIYUN_ACR_REGISTRY、ALIYUN_DOCKER_IMAGE、ALIYUN_SITE_URL、ALIYUN_BASE；Secrets: ALIYUN_REGISTRY_USERNAME、ALIYUN_REGISTRY_PASSWORD。',
  tencent: '- TENCENT_DOCKER_ENABLED=true；Vars: TENCENT_CCR_REGISTRY、TENCENT_DOCKER_IMAGE、TENCENT_SITE_URL、TENCENT_BASE；Secrets: TENCENT_REGISTRY_USERNAME、TENCENT_REGISTRY_PASSWORD。',
  dockerhub: '- DOCKERHUB_ENABLED=true；Vars: DOCKERHUB_IMAGE、DOCKERHUB_SITE_URL、DOCKERHUB_BASE；Secrets: DOCKERHUB_USERNAME、DOCKERHUB_TOKEN。',
}

// 未选自动部署时，部分目标需要额外的手动发布说明
const localEnvNote = name => `本地设置对应环境变量（${DEPLOY_SPECS[name][1]}），然后运行 \`pnpm deploy:${name}\`；本地变量名与上述 Vars/Secrets 同名。`
const MANUAL_NOTES = {
  oss: localEnvNote,
  cos: localEnvNote,
  vercel: () => '设置 VITE_BASE、VITE_SITE_URL，运行 `pnpm deploy:vercel:prepare`，再通过 Vercel CLI 发布 `.vercel/output`。',
  cloudflare: () => '在 Cloudflare Pages 连接 Git 仓库；构建命令 `pnpm build`，输出目录 `dist`，配置生产域名 VITE_SITE_URL 和 VITE_BASE。不要同时启用另一套自动发布。',
}

function deploymentSection(name, automated) {
  const [flag, details] = DEPLOY_SPECS[name]
  const parts = [`## ${targets[name]}`]
  if (automated) {
    parts.push(`使用现有 GitHub Actions 工作流。自动触发需设置仓库变量 \`${flag}\`；手动运行规则沿用现有工作流。`, details)
  }
  else {
    parts.push('仅生成现有平台脚本及配置说明，不生成 GitHub Actions 部署工作流。')
    const note = MANUAL_NOTES[name]?.(name)
    if (note)
      parts.push(note)
  }
  return parts.join('\n\n')
}

function deploymentReadme(options) {
  const entries = options.targets.map(name => deploymentSection(name, options.automation.includes(name)))
  if (options.registries.length) {
    const list = options.registries.map(value => REGISTRY_SPECS[value]).join('\n')
    entries.push(`## 镜像发布\n\n生成 docker-cloud 工作流。仅启用下列选中的仓库变量，其他目标保持关闭：\n\n${list}`)
  }
  return `# 部署说明\n\n仅生成配置，不立即部署。部署构建使用 \`VITE_BASE\` 和 \`VITE_SITE_URL\`；执行 \`pnpm build:deploy\` 前需设置完整站点地址。CI、Docker 和部署使用冻结安装，提交前先执行 \`pnpm install\` 并提交匹配的锁文件。\n\n${entries.join('\n\n')}\n`
}

// ---------------------------------------------------------------------------
// 落盘
// ---------------------------------------------------------------------------

/**
 * 写入前的安全检查：
 *   - 目标及其每一级上级目录都不能是符号链接，防止写入被重定向到别处；
 *   - 目标目录必须不存在或为空（允许保留 .git、.DS_Store），避免覆盖已有文件。
 */
export function assertTarget(plan) {
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

/**
 * 把创建计划写入磁盘，返回目标目录。
 * 文件以 wx 标志创建，已存在即报错，不会覆盖；写出路径必须落在目标目录内。
 */
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
  fs.mkdirSync(path.join(plan.target, GENERATED_DIR), { recursive: true })
  return plan.target
}
