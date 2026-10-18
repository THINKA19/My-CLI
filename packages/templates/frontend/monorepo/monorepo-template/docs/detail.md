# 重要文件详解

## bin/index.js

```js
#!/usr/bin/env node
// 👆 Shebang（哈希bang）：指定该文件使用系统 Path 中的 node 解释器执行，使脚本可以作为 CLI 命令（如 npx create-xxx）直接运行
/* eslint-disable no-console */

import { execSync } from 'node:child_process' // 引入同步子进程执行模块，用于在代码中直接运行 Shell 命令（如 pnpm install）
import fs from 'node:fs' // 引入 Node.js 原生文件系统模块，用于目录/文件的读取、复制、重命名与写入
import path from 'node:path' // 引入 Node.js 原生路径处理模块，用于跨平台路径拼装与解析
import { fileURLToPath } from 'node:url' // 引入 URL 转换工具，用于把 ES Module 内部的 import.meta.url 转为绝对路径

// 获取模板目录（template）的绝对路径：
// import.meta.url -> 当前文件的 URL (如 file:///.../bin/index.js)
// fileURLToPath(...) -> 转换为绝对文件路径
// path.dirname(...) -> 获取当前文件所在目录 (如 .../bin)
// path.resolve(..., '../template') -> 向上找一级目录并拼上 template (如 .../template)
const templateDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../template')

// 定义拷贝模板文件时需要跳过的文件或目录集合（Set 结构查询效率高）
const SKIP = new Set(['node_modules', 'dist', '.npmignore', '.git', '.DS_Store', 'pnpm-lock.yaml', '.turbo'])

/**
 * 封装统一的错误处理并退出程序
 * @param {string} message 错误提示信息
 */
function fail(message) {
  console.error(`\n✖ ${message}\n`) // 在控制台输出带红色/错误图标的错误提示
  process.exit(1) // 以非 0 状态码退出进程，表示程序异常中断
}

// ---------- 参数解析 ----------
// process.argv 保存了命令行执行时的所有参数，前两个分别是 [node路径, 脚本路径]
// slice(2) 截取从第三个参数开始的用户输入（如: npx create-xxx my-app --install）
const args = process.argv.slice(2)

// 判断参数列表中是否传递了 --install 标志，以决定创建项目后是否自动运行 pnpm install
const shouldInstall = args.includes('--install')

// 查找第一个不以 '-' 开头的参数，将其作为用户指定的项目名称（如 'my-app' 或 '.'）
const name = args.find(arg => !arg.startsWith('-'))

// 如果用户没有输入任何项目名，则触发报错并退出
if (!name) {
  fail('请指定项目名,例如:npx create-xxx my-app(在当前空目录创建则用 .)')
}

// 获取目标项目的绝对路径：将当前执行 Shell 的工作目录（process.cwd()）与用户输入的 name 进行拼装
const targetDir = path.resolve(process.cwd(), name)

// 获取目标目录的最末端文件夹名称（作为 package.json 里的 name 属性）
const projectName = path.basename(targetDir)

// 使用正则表达式校验项目名格式：
// 必须以字母或数字开头，且只包含小写字母、数字、点(.)、下划线(_)和连字符(-)
if (!/^[a-z0-9][\w.-]*$/i.test(projectName)) {
  fail(`项目名 "${projectName}" 不合法,只能包含字母、数字、点、下划线和连字符`)
}

// ---------- 前置校验 ----------
// 1. 校验模板目录是否存在，若脚手架安装/打包异常找不到 template 目录则拦截
if (!fs.existsSync(templateDir)) {
  fail(`未找到模板目录:${templateDir}`)
}

// 2. 校验目标目录：如果目标目录已存在，且里面包含任何文件（不为空），为防止覆写用户代码，拦截并报错
if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
  fail(`目录 "${targetDir}" 已存在且不为空,请换一个名字或在空目录中执行`)
}

console.log('\n🚀 正在创建项目...\n')

// ---------- 1. 拷贝模板 ----------
// 使用 Node.js 原生的 fs.cpSync 进行递归文件/目录拷贝
fs.cpSync(templateDir, targetDir, {
  recursive: true, // 开启递归拷贝（复制子目录及文件）
  filter: src => !SKIP.has(path.basename(src)), // 过滤函数：如果当前文件/文件夹名称在 SKIP 集合中则过滤掉
})

// ---------- 2. _gitignore -> .gitignore ----------
// 解释：如果模板里直接放 `.gitignore`，在把这个脚手架 CLI 工具 npm publish 发布到 npm 仓库时，
// npm 会默认忽略 `.gitignore` 导致它无法上传到 npm 仓库。
// 因此模板中通常用 `_gitignore` 命名，在项目生成后将其重命名为 `.gitignore`
const gitignore = path.join(targetDir, '_gitignore')
if (fs.existsSync(gitignore)) {
  fs.renameSync(gitignore, path.join(targetDir, '.gitignore'))
}

// ---------- 3. 写入项目名(模板暂无 package.json 时跳过) ----------
// 查找拷贝过去的目标目录中的 package.json 文件
const pkgPath = path.join(targetDir, 'package.json')
if (fs.existsSync(pkgPath)) {
  // 读取 package.json 的文本内容并解析为 JavaScript JSON 对象
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))

  // 将 package.json 中的 "name" 字段更新为用户输入的项目名称
  pkg.name = projectName

  // 将更新后的 JSON 对象重新格式化为字符串（保留 2 空格缩进并追加末尾换行），写回 package.json
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
}

console.log('✔ 模板已生成')

// ---------- 4. 安装依赖(可用 生成后自动 pnpm install) ----------
let installed = false

// 如果命令行传了 --install 参数，且项目生成了 package.json 文件，则尝试执行自动安装
if (shouldInstall && fs.existsSync(pkgPath)) {
  try {
    console.log('\n📦 正在安装依赖...\n')

    // 同步执行 Shell 命令：pnpm install
    // cwd: targetDir -> 在创建好的新项目目录下执行安装命令
    // stdio: 'inherit' -> 将子进程的终端输出直接继承到当前命令行，用户可以看到具体的安装进度与日志
    execSync('pnpm install', { cwd: targetDir, stdio: 'inherit' })

    installed = true // 标记依赖已成功安装
    console.log('\n✔ 依赖安装完成')
  }
  catch {
    // 捕获可能出现的错误（如用户未安装 pnpm、网络断开等），进行友好警告提示，不直接让整个程序崩溃
    console.warn('\n⚠ 依赖自动安装失败(可能未安装 pnpm 或网络异常),请稍后手动执行 pnpm install')
  }
}

// ---------- 5. 后续提示 ----------
const steps = []

// 如果创建的项目路径不等于当前工作目录（即用户不是在当前目录 '.' 创建，而是创建了新文件夹），提示需要先 cd 到该文件夹
if (path.resolve(name) !== process.cwd())
  steps.push(`cd ${name}`)

// 如果依赖没有自动安装，将安装依赖命令加入后续引导步骤中
if (!installed)
  steps.push('pnpm install')

// 添加启动开发服务器的引导命令
steps.push('pnpm dev')

// 打印最终成功提示信息，并输出格式化的后续执行命令指引
console.log(`\n🎉 项目已创建:${targetDir}\n\n接下来:\n${steps.map(s => `  ${s}`).join('\n')}\n`)
```

