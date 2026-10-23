#!/usr/bin/env node
/* eslint-disable no-console */
import { execSync } from 'node:child_process'
import { createPlan, writePlan } from '../lib/generate.js'
import { help, parseArgs } from '../lib/options.js'
import { Cancelled, collectOptions } from '../lib/prompts.js'

async function main() {
  const args = process.argv.slice(2)
  const parsed = parseArgs(args)
  if (parsed.help) {
    console.log(help)
    return
  }
  if (!parsed.yes && !parsed.dryRun && (!process.stdin.isTTY || !process.stdout.isTTY))
    throw new Error('非交互环境请使用 --yes')
  const options = parsed.yes || parsed.dryRun ? parsed.options : await collectOptions(parsed.options)
  if (!options) {
    console.log('已取消，未创建项目。')
    return
  }
  const plan = createPlan(options)
  if (parsed.dryRun) {
    console.log(`预览目标：${plan.target}\n${[...plan.files.keys()].sort().join('\n')}\n共 ${plan.files.size} 个文件，未创建项目。`)
    return
  }
  const target = writePlan(plan)
  console.log(`✔ 项目已创建：${target}`)
  if (options.install) {
    try {
      execSync('pnpm install', { cwd: target, stdio: 'inherit' })
    }
    catch {
      console.error('安装失败，文件保留，请手动运行 pnpm install')
      process.exitCode = 1
      return
    }
  }
  console.log(`cd "${target}"\n${options.install ? '' : 'pnpm install\n'}pnpm dev`)
}
main().catch((error) => {
  console.error(error instanceof Cancelled ? '已取消，未创建项目。' : error.message)
  process.exitCode = error instanceof Cancelled ? 130 : 1
})
