import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertTarget, featureLabels, normalizeOptions } from './options.js'

const templateDir = fileURLToPath(new URL('../templates/', import.meta.url))
const skip = new Set(['node_modules', 'dist', '.npmignore', '.git', '.DS_Store', 'pnpm-lock.yaml', '.turbo'])
const rename = { _gitignore: '.gitignore' }
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
  for (const feature of options.features) {
    const directory = path.join(templateDir, 'features', feature)
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
  const extensions = parse('.vscode/extensions.json')
  if (has('unit-test')) {
    const tsconfig = parse('tsconfig.json')
    tsconfig.references.push({ path: './tsconfig.vitest.json' })
    files.set('tsconfig.json', encode(tsconfig))
    extensions.recommendations.push('vitest.explorer')
  }
  if (has('e2e'))
    extensions.recommendations.push('ms-playwright.playwright')
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
    const oxlint = parse('.oxlintrc.json')
    if (!has('unit-test'))
      oxlint.plugins = oxlint.plugins.filter(p => p !== 'vitest')
    files.set('.oxlintrc.json', encode(oxlint))
    const settings = JSON.parse(fs.readFileSync(path.join(templateDir, 'features/code-quality/settings.fragment.json'), 'utf8'))
    files.set('.vscode/settings.json', encode({ ...parse('.vscode/settings.json'), ...settings }))
    extensions.recommendations.push('dbaeumer.vscode-eslint', 'EditorConfig.EditorConfig', 'oxc.oxc-vscode')
  }
  files.set('.vscode/extensions.json', encode(extensions))
  pkg.name = name
  files.set('package.json', encode(pkg))
  let readme = files.get('README.md').toString().replace(/\r\n/g, '\n')
  const sections = [['unit-test', 'Run Unit Tests'], ['e2e', 'Run End-to-End Tests'], ['code-quality', 'Lint with']]
  for (const [feature, title] of sections) {
    if (!has(feature))
      readme = readme.replace(new RegExp(`### ${title}[\\s\\S]*?(?=\\n### |$)`), '')
  }
  files.set('README.md', `${readme.replace('# base', `# ${name}`).trimEnd()}\n\n已选功能：${options.features.map(f => featureLabels[f]).join('、') || '无'}\n`)
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
