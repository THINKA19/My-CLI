import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { featureModules } from './features.js'
import { httpLibraries } from './http.js'
import { assertTarget, normalizeOptions } from './options.js'
import { projectTypes } from './project-types.js'
import { uiLibraries } from './ui.js'

const templateDir = fileURLToPath(new URL('../templates/', import.meta.url))
const skip = new Set(['node_modules', 'dist', '.npmignore', '.git', '.DS_Store', 'pnpm-lock.yaml', '.turbo'])
const rename = { '_gitignore': '.gitignore', '_env.development': '.env.development', '_env.production': '.env.production' }
const encode = value => `${JSON.stringify(value, null, 2)}\n`
export function createPlan(input = {}, cwd = process.cwd()) {
  const options = normalizeOptions(input)
  const target = path.resolve(cwd, options.location)
  const name = path.basename(target)
  if (!/^[a-z0-9][\w.-]*$/i.test(name))
    throw new Error('项目名不合法')
  assertTarget(target)
  const files = new Map()
  const has = feature => options.features.includes(feature)
  function add(directory, relative = '') {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (skip.has(entry.name) || entry.name.endsWith('.fragment.json'))
        continue
      const source = path.join(directory, entry.name)
      if (entry.isSymbolicLink())
        throw new Error(`模板不支持符号链接：${source}`)
      const destination = path.posix.join(relative, rename[entry.name] || entry.name)
      if (entry.isDirectory()) {
        add(source, destination)
      }
      else {
        if (files.has(destination))
          throw new Error(`模板文件冲突：${destination}`)
        files.set(destination, fs.readFileSync(source))
      }
    }
  }
  add(path.join(templateDir, 'base'))
  const parse = file => JSON.parse(files.get(file).toString())
  const pkg = parse('package.json')
  const ui = uiLibraries[options.ui]
  function addModule(directory) {
    add(directory)
    const fragment = JSON.parse(fs.readFileSync(path.join(directory, 'package.fragment.json'), 'utf8'))
    for (const field of ['scripts', 'dependencies', 'devDependencies']) {
      for (const [key, value] of Object.entries(fragment[field] || {})) {
        pkg[field] ||= {}
        if (Object.hasOwn(pkg[field], key) && pkg[field][key] !== value)
          throw new Error(`配置冲突：${key}`)
        pkg[field][key] = value
      }
    }
  }
  add(path.join(templateDir, 'platform', options.type))
  addModule(path.join(templateDir, 'ui', ui.template))
  addModule(path.join(templateDir, 'http', options.http))
  for (const feature of options.features)
    addModule(path.join(templateDir, 'features', featureModules[feature].directory))
  if (has('jsx')) {
    const vite = files.get('vite.config.ts').toString().replace(/\r\n/g, '\n').replace('import vue from \'@vitejs/plugin-vue\'', 'import vue from \'@vitejs/plugin-vue\'\nimport vueJsx from \'@vitejs/plugin-vue-jsx\'').replace('      vue(),', '      vue(),\n      vueJsx(),')
    files.set('vite.config.ts', vite)
  }
  if (has('theme'))
    add(path.join(templateDir, 'theming', ui.template))
  function edit(file, transform) {
    files.set(file, transform(files.get(file).toString().replace(/\r\n/g, '\n')))
  }
  if (has('theme')) {
    files.set('src/app/FeatureShell.vue', '<script setup lang="ts">\nimport ThemeBridge from \'@/ui/ThemeBridge.vue\'\n</script>\n<template><ThemeBridge><slot /></ThemeBridge></template>\n')
  }
  else {
    edit('src/app/App.vue', text => text.replace('import FeatureShell from \'./FeatureShell.vue\'\n', '').replace('<FeatureShell><RouterView /></FeatureShell>', '<RouterView />'))
  }
  const modules = options.features.map(feature => featureModules[feature])
  const installers = modules.filter(module => module.install)
  if (installers.length) {
    files.set('src/app/plugins.ts', `${installers.map((module, index) => `import { install as install${index} } from '${module.install}'`).join('\n')}\nimport type { App } from 'vue'\n\nexport function installFeatures(app: App) {\n${installers.map((_, index) => `  install${index}(app)`).join('\n')}\n}\n`)
  }
  else {
    edit('src/app/main.ts', text => text.replace('import { installFeatures } from \'./plugins\'\n', '').replace('installFeatures(app)\n', ''))
    if (has('unit-test')) {
      edit('src/components/__tests__/HomeView.spec.ts', text => text.replace('import { installFeatures } from \'@/app/plugins\'\n', '').replace('mount(HomeView, { global: { plugins: [{ install: installFeatures }] } })', 'mount(HomeView)'))
    }
  }
  const demos = modules.filter(module => module.demo)
  if (demos.length) {
    files.set('src/app/FeatureDemos.vue', `<script setup lang="ts">\n${demos.map((module, index) => `import Demo${index} from '${module.demo}'`).join('\n')}\n</script>\n<template>\n${demos.map((_, index) => `  <Demo${index} />`).join('\n')}\n</template>\n`)
  }
  else {
    edit('src/app/pages/HomeView.vue', text => text.replace('import FeatureDemos from \'../FeatureDemos.vue\'\n', '').replace('  <FeatureDemos />\n', ''))
  }
  const vitePlugins = modules.filter(module => module.vite)
  if (vitePlugins.length) {
    files.set('config/plugins.ts', `${vitePlugins.map((module, index) => `import { analyzePlugin as plugin${index} } from '${module.vite}'`).join('\n')}\nimport type { PluginOption } from 'vite'\nexport function featurePlugins(): PluginOption[] { return [${vitePlugins.map((_, index) => `plugin${index}()`).join(', ')}] }\n`)
  }
  else {
    edit('vite.config.ts', text => text.replace('import { featurePlugins } from \'./config/plugins.ts\'\n', '').replace('      ...featurePlugins(),\n', ''))
  }
  const extensions = parse('.vscode/extensions.json')
  if (has('unit-test')) {
    const tsconfig = parse('tsconfig.json')
    tsconfig.references.push({ path: './tsconfig.vitest.json' })
    files.set('tsconfig.json', encode(tsconfig))
    extensions.recommendations.push('vitest.explorer')
    for (const feature of options.features) {
      const checks = path.join(templateDir, 'checks', feature)
      if (fs.existsSync(checks))
        add(checks)
    }
  }
  if (has('e2e')) {
    extensions.recommendations.push('ms-playwright.playwright')
    add(path.join(templateDir, 'platform-checks', options.type))
    for (const feature of options.features) {
      const checks = path.join(templateDir, 'browser-checks', feature)
      if (fs.existsSync(checks))
        add(checks)
    }
  }
  if (has('code-quality')) {
    let eslint = files.get('eslint.config.ts').toString().replace(/\r\n/g, '\n')
    for (const [feature, plugin, dependency] of [['unit-test', 'pluginVitest', '@vitest/eslint-plugin'], ['e2e', 'pluginPlaywright', 'eslint-plugin-playwright']]) {
      if (!has(feature)) {
        delete pkg.devDependencies[dependency]
        eslint = eslint.replace(new RegExp(`^import ${plugin}.*\\n`, 'm'), '')
        eslint = eslint.replace(new RegExp(`  \{\\n    \\.\\.\\.${plugin}[\\s\\S]*?\\n  \},\\n`), '')
      }
    }
    files.set('eslint.config.ts', eslint)
    const settings = JSON.parse(fs.readFileSync(path.join(templateDir, 'features/code-quality/settings.fragment.json'), 'utf8'))
    files.set('.vscode/settings.json', encode({ ...parse('.vscode/settings.json'), ...settings }))
    extensions.recommendations.push('dbaeumer.vscode-eslint', 'EditorConfig.EditorConfig', 'oxc.oxc-vscode')
  }
  files.set('.vscode/extensions.json', encode(extensions))
  pkg.name = options.location === '.' ? 'vue-project' : name
  pkg.version = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version
  const scriptOrder = ['dev', 'build', 'preview', 'analyze', 'test:unit', 'test:e2e', 'build-only', 'type-check', 'lint', 'lint:oxlint', 'lint:eslint', 'format']
  pkg.scripts = Object.fromEntries(scriptOrder.filter(key => Object.hasOwn(pkg.scripts, key)).map(key => [key, pkg.scripts[key]]))
  for (const field of ['dependencies', 'devDependencies'])
    pkg[field] = Object.fromEntries(Object.entries(pkg[field]).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0))
  files.set('package.json', encode(pkg))
  let readme = files.get('README.md').toString().replace(/\r\n/g, '\n')
  const sections = [['unit-test', 'Run Unit Tests'], ['e2e', 'Run End-to-End Tests'], ['code-quality', 'Lint with']]
  for (const [feature, title] of sections) {
    if (!has(feature))
      readme = readme.replace(new RegExp(`### ${title}[\\s\\S]*?(?=\\n### |$)`), '')
  }
  files.set('README.md', `${readme.replace(/^# .*/m, `# ${pkg.name}`)}\n## 项目类型\n\n${projectTypes[options.type].label}\n\n## UI 组件库\n\n已初始化 ${ui.label}，只安装这一个 UI 库。运行 pnpm dev 后，首页按钮可增加计数。\n示例：src/ui/UiDemo.vue；组件在示例中显式导入，初始化入口为 src/ui/setup.ts，由 src/app/main.ts 统一加载（Naive UI 自动注入样式）。\n\n## HTTP 请求库\n\n已初始化 ${httpLibraries[options.http].label}。src/http/client.ts 创建请求实例，src/http/example.ts 请求 public/mock/hello.json，首页展示加载、成功和失败状态。该 JSON 是本地静态示例，不是业务 API；Mock 请求地址遵循 Vite BASE_URL，业务 API 由 VITE_API_BASE_URL 配置。开发说明见 docs/DEVELOPMENT.md；模块与升级说明见 docs/MODULES.md、docs/UPGRADING.md。\n`)
  return { target, options, files }
}
export function writePlan(plan) {
  assertTarget(plan.target)
  for (const [relative, content] of plan.files) {
    const file = path.join(plan.target, relative)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, content)
  }
  return plan.target
}
