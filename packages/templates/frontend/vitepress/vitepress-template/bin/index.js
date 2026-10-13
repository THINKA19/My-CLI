#!/usr/bin/env node
/* eslint-disable no-console */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const templateDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../template',
)

// 复制模板时跳过的文件/目录
const SKIP = new Set([
  'node_modules',
  'dist',
  'cache',
  '.git',
  '.DS_Store',
  '.npmignore',
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
])

// 模板里以 _ 开头的文件，生成后改回正式名称（npm 发布时会丢弃/改写点文件）
const RENAME = {
  _gitignore: '.gitignore',
  _npmrc: '.npmrc',
  _dockerignore: '.dockerignore',
}

// 判断目录是否“实质为空”时忽略的条目
const IGNORABLE = new Set(['.git', '.DS_Store'])

const HELP = `
用法:
  npx create-xxx <项目名> [选项]
  npx create-xxx .            在当前空目录中创建

选项:
  --install     创建后自动安装依赖（默认不安装）
  -h, --help    显示帮助
`

function fail(message) {
  console.error(`\n✖ ${message}\n`)
  process.exit(1)
}

// 根据启动方式识别包管理器：npm / pnpm / yarn / bun
function detectPackageManager() {
  const ua = process.env.npm_config_user_agent || ''
  const name = ua.split(' ')[0]?.split('/')[0]
  return ['pnpm', 'yarn', 'bun'].includes(name) ? name : 'npm'
}

// ---------- 参数解析 ----------
const args = process.argv.slice(2)

if (args.includes('-h') || args.includes('--help')) {
  console.log(HELP)
  process.exit(0)
}

const knownFlags = new Set(['--install'])
const unknownFlag = args.find(a => a.startsWith('-') && !knownFlags.has(a))
if (unknownFlag) {
  fail(`未知参数 "${unknownFlag}"，使用 --help 查看用法`)
}

const shouldInstall = args.includes('--install')
const name = args.find(a => !a.startsWith('-'))

if (!name) {
  fail('请指定项目名，例如: npx create-xxx my-docs（在当前空目录创建请用 .）')
}

const targetDir = path.resolve(process.cwd(), name)
const projectName = path.basename(targetDir)

// 与 npm 包名规则保持一致：小写字母、数字、点、下划线、连字符
if (!/^[a-z0-9][a-z0-9._-]*$/.test(projectName)) {
  fail(`项目名 "${projectName}" 不合法，只能包含小写字母、数字、点、下划线和连字符，且以字母或数字开头`)
}

// ---------- 前置校验 ----------
if (!fs.existsSync(templateDir)) {
  fail(`未找到模板目录: ${templateDir}`)
}

if (fs.existsSync(targetDir)) {
  const entries = fs.readdirSync(targetDir).filter(f => !IGNORABLE.has(f))
  if (entries.length > 0) {
    fail(`目录 "${targetDir}" 不为空，请换一个项目名或在空目录中执行`)
  }
}

console.log('\n🚀 正在创建 VitePress 项目...\n')

// ---------- 1. 复制模板（复制时过滤，而不是事后删除） ----------
fs.cpSync(templateDir, targetDir, {
  recursive: true,
  filter: src => !SKIP.has(path.basename(src)),
})

// ---------- 2. 还原被重命名的点文件 ----------
for (const [from, to] of Object.entries(RENAME)) {
  const fromPath = path.join(targetDir, from)
  if (fs.existsSync(fromPath)) {
    fs.renameSync(fromPath, path.join(targetDir, to))
  }
}

// ---------- 3. 写入项目名 ----------
const pkgPath = path.join(targetDir, 'package.json')
if (fs.existsSync(pkgPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    pkg.name = projectName
    fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
  }
  catch {
    fail('模板中的 package.json 解析失败，请检查模板文件')
  }
}

console.log('✔ 模板已生成')

// ---------- 4. 可选：安装依赖 ----------
const pm = detectPackageManager()
let installed = false

if (shouldInstall && fs.existsSync(pkgPath)) {
  try {
    console.log(`\n📦 正在使用 ${pm} 安装依赖...\n`)
    execSync(`${pm} install`, { cwd: targetDir, stdio: 'inherit' })
    installed = true
    console.log('\n✔ 依赖安装完成')
  }
  catch {
    console.warn(`\n⚠ 依赖安装失败（可能未安装 ${pm} 或网络异常），请稍后手动执行 ${pm} install`)
  }
}

// ---------- 5. 后续提示 ----------
const steps = []
const relative = path.relative(process.cwd(), targetDir)

if (relative)
  steps.push(`cd ${relative}`)

if (!installed)
  steps.push(`${pm} install`)

steps.push(pm === 'npm' ? 'npm run dev' : `${pm} dev`)

console.log(`\n🎉 项目已创建: ${targetDir}\n\n接下来:\n${steps.map(s => `  ${s}`).join('\n')}\n`)
