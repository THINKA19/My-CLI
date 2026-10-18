#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * create-vitepress-template 命令行入口
 *
 * 作用：
 *   创建 VitePress 文档站点项目的脚手架 CLI。负责接收用户输入、生成创建计划、
 *   校验目标目录、写入文件，并按需安装依赖、输出后续操作指引。
 *   具体的计划生成与文件写入在 ../lib/generate.js，
 *   交互问答与摘要展示在 ../lib/prompts.js，本文件只做流程编排。
 *
 * 两种运行模式：
 *   1. 自动化模式（带 --yes / -y）
 *      跳过所有交互，完全依据命令行参数生成计划；未指定的功能默认不启用。
 *      适合 CI、脚本调用。
 *   2. 交互模式（默认）
 *      逐项问答收集配置 -> 生成计划并校验 -> 展示摘要 -> 用户确认。
 *      校验失败或用户选择"返回修改"时回到问答，选择"取消"则退出。
 *
 * 执行流程：
 *   解析参数 -> （自动化 | 交互）得到 plan -> writePlan 落盘
 *   -> 可选 pnpm install -> 打印下一步命令
 *
 * 退出码：
 *   0    成功（含 --help）
 *   1    运行出错，或依赖安装失败（项目文件保留）
 *   130  用户主动取消（Ctrl+C / Esc），未生成任何项目文件
 *
 * 用法：
 *   create-vitepress-template [创建位置] [选项]
 *   详见下方 HELP 或执行 --help。
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { assertTarget, createPlan, writePlan } from '../lib/generate.js'
import { Cancelled, collectOptions, prompt, summary } from '../lib/prompts.js'

// ---------------------------------------------------------------------------
// 帮助文档
// ---------------------------------------------------------------------------

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
  --enhancements=mermaid,image-zoom,reading-progress
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

// ---------------------------------------------------------------------------
// 参数解析
// ---------------------------------------------------------------------------

// 逗号分隔的数组类参数：命令行名 -> options 字段名
const LIST_OPTIONS = new Map([
  ['features', 'features'],
  ['enhancements', 'enhancements'],
  ['languages', 'languages'],
  ['targets', 'targets'],
  ['automation', 'automation'],
  ['registries', 'registries'],
])

// 单值字符串类参数：命令行名 -> options 字段名
const SCALAR_OPTIONS = new Map([
  ['default-language', 'defaultLanguage'],
  ['package-name', 'packageName'],
])

// 无值开关：命令行名 -> options 字段名
const FLAG_OPTIONS = new Map([
  ['--install', 'install'],
  ['--docker', 'docker'],
  ['--i18n', 'i18n'],
])

/**
 * 解析命令行参数，返回 { options, yes }。
 * 使用 Map 而非对象字面量查表，避免 --constructor=x 等参数命中原型属性。
 * 位置参数（不以 - 开头）视为创建位置，只允许一个。
 */
function parseArgs(args) {
  const options = {}
  let yes = false

  for (const arg of args) {
    if (arg === '--yes' || arg === '-y') {
      yes = true
    }
    else if (FLAG_OPTIONS.has(arg)) {
      options[FLAG_OPTIONS.get(arg)] = true
    }
    else if (arg.startsWith('--') && arg.includes('=')) {
      const [name, ...rest] = arg.slice(2).split('=')
      const value = rest.join('=')
      if (LIST_OPTIONS.has(name))
        options[LIST_OPTIONS.get(name)] = value ? value.split(',') : []
      else if (SCALAR_OPTIONS.has(name))
        options[SCALAR_OPTIONS.get(name)] = value
      else throw new Error(`未知参数 ${arg}`)
    }
    else if (arg.startsWith('-')) {
      throw new Error(`未知参数 ${arg}`)
    }
    else if (options.location !== undefined) {
      throw new Error('只能指定一个创建位置')
    }
    else {
      options.location = arg
    }
  }

  return { options, yes }
}

// ---------------------------------------------------------------------------
// 依赖安装
// ---------------------------------------------------------------------------

/**
 * 执行 pnpm install。存在 monorepo 工作区时在工作区根目录执行，
 * 否则在新项目目录执行。成功返回 true；失败仅给出提示，不删除已生成的文件。
 *
 * 命令为固定字符串，没有拼接任何用户输入，shell: true 是安全的；
 * 使用 shell 是因为 Windows 上 pnpm 实际是 pnpm.cmd。
 */
function installDependencies(plan) {
  const cwd = plan.workspace?.root || plan.target
  console.log(`\n正在安装依赖：${cwd}\n`)
  const result = spawnSync('pnpm install', { cwd, stdio: 'inherit', shell: true, windowsHide: true })
  if (result.error || result.status !== 0) {
    console.warn(`依赖安装未完成，请在 ${cwd} 手动运行 pnpm install。项目文件已保留。`)
    process.exitCode = 1
    return false
  }
  return true
}

// ---------------------------------------------------------------------------
// 计划生成：自动化模式与交互模式
// ---------------------------------------------------------------------------

/** 自动化模式：直接依据命令行参数生成并校验计划，校验失败会抛出异常。 */
function planFromArgs(options) {
  const plan = createPlan(options)
  assertTarget(plan)
  console.log(summary(plan))
  return plan
}

/** 询问用户是否放弃；选择取消时抛出 Cancelled，否则返回所选动作。 */
async function askAction(title, choices) {
  const action = await prompt({ title, choices })
  if (action === 'cancel')
    throw new Cancelled('已取消')
  return action
}

/**
 * 交互模式：循环 收集选项 -> 生成并校验计划 -> 展示摘要 -> 确认。
 * 校验失败可选择返回修改或取消；确认页可选择开始创建、返回修改或取消。
 */
async function planFromWizard(initialOptions) {
  let options = initialOptions
  while (true) {
    options = await collectOptions(options)

    let plan
    try {
      plan = createPlan(options)
      assertTarget(plan)
    }
    catch (error) {
      console.error(`\n${error.message}\n`)
      await askAction('调整创建配置', [
        { value: 'edit', label: '返回修改' },
        { value: 'cancel', label: '取消' },
      ])
      continue
    }

    console.log(summary(plan))
    const action = await askAction('确认创建配置', [
      { value: 'create', label: '开始创建' },
      { value: 'edit', label: '返回修改' },
      { value: 'cancel', label: '取消' },
    ])
    if (action === 'create')
      return plan
  }
}

// ---------------------------------------------------------------------------
// 主流程
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2)

  if (args.some(arg => arg === '-h' || arg === '--help')) {
    console.log(HELP)
    return
  }

  const { options, yes } = parseArgs(args)
  const plan = yes ? planFromArgs(options) : await planFromWizard(options)

  // 落盘并输出后续指引
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

// 统一处理异常：用户取消（Ctrl+C / Esc）退出码 130，其他错误退出码 1
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
