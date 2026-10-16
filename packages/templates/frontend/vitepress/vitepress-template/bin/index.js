#!/usr/bin/env node
/* eslint-disable no-console */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { assertTarget, createPlan, writePlan } from '../lib/generate.js'
import { Cancelled, collectOptions, prompt, summary } from '../lib/prompts.js'

const HELP = `
用法：
  create-vitepress-template [创建位置] [选项]
  create-vitepress-template .               在当前空目录创建
  create-vitepress-template my-docs         新建子目录，进入交互问答

交互：↑↓ 选择，Space 多选，Enter 确认；Ctrl+C / Esc 取消。
创建位置默认 .；输入 my-docs 新建目录，输入 . 或直接回车使用当前目录。

自动化选项（--yes 跳过交互，未指定功能默认不启用）：
  --yes, -y
  --features=eslint,git-hooks,ci
  --enhancements=mermaid
  --i18n --languages=zh,en,vi --default-language=zh
  --languages=en                           单语言 English
  --targets=github-pages,vercel,cloudflare,oss,cos,server
  --automation=github-pages,vercel          生成所选目标的自动部署工作流
  --docker
  --registries=aliyun,tencent,dockerhub     Docker 镜像发布
  --package-name=@scope/docs
  --install                               创建后安装依赖
  -h, --help

当前 GitHub Pages、自有服务器沿用已有 GitHub Actions 部署。
自有服务器需要 --automation=server 和至少一个镜像仓库。
不包含尚未实现的 GSAP 或服务器静态文件部署。
`

function parseArgs(args) {
  const result = {}
  let yes = false
  const list = { features: 'features', enhancements: 'enhancements', languages: 'languages', targets: 'targets', automation: 'automation', registries: 'registries' }
  const scalar = { 'default-language': 'defaultLanguage', 'package-name': 'packageName' }
  for (const arg of args) {
    if (arg === '--yes' || arg === '-y') {
      yes = true
    }
    else if (arg === '--install') {
      result.install = true
    }
    else if (arg === '--docker') {
      result.docker = true
    }
    else if (arg === '--i18n') {
      result.i18n = true
    }
    else if (arg.startsWith('--') && arg.includes('=')) {
      const [name, ...rest] = arg.slice(2).split('=')
      const value = rest.join('=')
      if (list[name])
        result[list[name]] = value ? value.split(',') : []
      else if (scalar[name])
        result[scalar[name]] = value
      else throw new Error(`未知参数 ${arg}`)
    }
    else if (arg.startsWith('-')) {
      throw new Error(`未知参数 ${arg}`)
    }
    else if (result.location !== undefined) {
      throw new Error('只能指定一个创建位置')
    }
    else {
      result.location = arg
    }
  }
  return { options: result, yes }
}

function installDependencies(plan) {
  const cwd = plan.workspace?.root || plan.target
  console.log(`\n正在安装依赖：${cwd}\n`)
  // Fixed command: no user-controlled strings are interpolated into the shell.
  const result = spawnSync('pnpm install', { cwd, stdio: 'inherit', shell: true, windowsHide: true })
  if (result.error || result.status !== 0) {
    console.warn(`依赖安装未完成，请在 ${cwd} 手动运行 pnpm install。项目文件已保留。`)
    process.exitCode = 1
    return false
  }
  return true
}

async function main() {
  if (process.argv.slice(2).some(arg => ['-h', '--help'].includes(arg))) {
    console.log(HELP)
    return
  }
  const parsed = parseArgs(process.argv.slice(2))
  let options = parsed.options
  let plan
  if (parsed.yes) {
    plan = createPlan(options)
    assertTarget(plan)
    console.log(summary(plan))
  }
  else {
    while (true) {
      options = await collectOptions(options)
      try {
        plan = createPlan(options)
        assertTarget(plan)
      }
      catch (error) {
        console.error(`\n${error.message}\n`)
        const action = await prompt({ title: '调整创建配置', choices: [{ value: 'edit', label: '返回修改' }, { value: 'cancel', label: '取消' }] })
        if (action === 'cancel')
          throw new Cancelled('已取消')
        continue
      }
      console.log(summary(plan))
      const action = await prompt({ title: '确认创建配置', choices: [{ value: 'create', label: '开始创建' }, { value: 'edit', label: '返回修改' }, { value: 'cancel', label: '取消' }] })
      if (action === 'cancel')
        throw new Cancelled('已取消')
      if (action === 'create')
        break
    }
  }
  writePlan(plan)
  console.log(`\n✔ 项目已创建：${plan.target}`)
  const installed = plan.options.install && installDependencies(plan)
  const steps = []
  if (plan.workspace) {
    console.log('请确认子项目路径已包含在 workspace packages 范围内；根目录配置未修改。')
    if (!installed)
      steps.push(`在 ${plan.workspace.root} 执行 pnpm install`)
  }
  if (plan.target !== process.cwd())
    steps.push(`cd "${path.relative(process.cwd(), plan.target)}"`)
  if (!installed && !plan.workspace)
    steps.push('pnpm install')
  steps.push('pnpm dev')
  console.log(`\n接下来：\n${steps.map(step => `  ${step}`).join('\n')}\n`)
}

main().catch((error) => {
  if (error instanceof Cancelled) {
    console.log('\n已取消，未生成项目文件。')
    process.exitCode = 130
  }
  else {
    console.error(`\n✖ ${error.message}\n`)
    process.exitCode = 1
  }
})
