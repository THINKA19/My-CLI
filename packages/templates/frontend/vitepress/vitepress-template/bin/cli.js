#!/usr/bin/env node

// 导入 Node.js 原生模块：用于执行命令行子进程、文件系统操作、路径解析及 ES Module 机制下的 URL 转换
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 在 ES Module 环境下模拟获取当前脚本文件的绝对路径与所在目录 (__dirname)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 定义脚手架内置模板（template）目录的绝对路径
const templateDir = path.resolve(__dirname, '../template')

// 获取用户执行 CLI 命令时所在的当前工作目录
const targetDir = process.cwd()

console.log('')
console.log('🚀 Creating VitePress project...')
console.log('')

// 校验：确保脚手架内部的 template 资源目录确实存在
if (!fs.existsSync(templateDir)) {
  console.error('❌ Template directory not found:')
  console.error(templateDir)
  process.exit(1)
}

// 获取目标目录下的现有文件列表，避免在非空目录下误操作覆写用户的既有代码
const existingFiles = fs.readdirSync(targetDir)

// 校验：若目标目录非空则终止脚本，提示用户在空目录下执行
if (existingFiles.length > 0) {
  console.error('❌ Target directory is not empty.')
  console.error('')
  console.error(`Directory: ${targetDir}`)
  console.error('')
  console.error('Please run this command inside an empty directory.')
  process.exit(1)
}

// 将内置 template 目录下的所有结构与文件递归复制到用户的当前工作目录
fs.cpSync(templateDir, targetDir, {
  recursive: true,
})

// 清理复制过程中可能意外误带入的 node_modules 依赖目录
const nodeModules = path.join(targetDir, 'node_modules')

if (fs.existsSync(nodeModules)) {
  fs.rmSync(nodeModules, {
    recursive: true,
    force: true,
  })
}

console.log('✓ Template copied')
console.log('')

// 自动在生成的项目目录下执行 pnpm install 安装依赖，并实时输出安装日志
try {
  console.log('📦 Installing dependencies...')
  console.log('')

  // 将标准输入输出挂载到父进程（stdio: 'inherit'），向终端实时打印 pnpm 安装日志
  execSync('pnpm install', {
    cwd: targetDir,
    stdio: 'inherit',
  })

  console.log('')
  console.log('✓ Dependencies installed')
}
catch {
  // 捕获网络异常或本地未安装 pnpm 等情况，给出降级手动提示
  console.log('')
  console.warn('⚠️ Failed to install dependencies automatically.')
  console.warn('You can run "pnpm install" manually.')
}

// 初始化完成提示与引导启动命令
console.log('')
console.log('🎉 Project created successfully!')
console.log('')
console.log('Next steps:')
console.log('')
console.log('  pnpm dev')
console.log('')
