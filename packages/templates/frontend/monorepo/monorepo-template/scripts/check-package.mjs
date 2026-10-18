/**
 * 发布包预检脚本（pre-publish check）
 *
 * 作用：
 *   在不真正发布的前提下，验证 `npm publish` 将要上传的文件是否正确。
 *   先用 `npm pack --dry-run` 取得 npm 实际会打包的文件清单，
 *   再与磁盘上 templates/、lib/、bin/ 的内容逐一比对。
 *
 * 检查项：
 *   1. 防漏发：templates/、lib/、bin/ 下应发布的文件必须全部出现在包中
 *      （避免 .npmignore 或 package.json 的 "files" 配置误排除）。
 *   2. 防错发：包中不得出现测试（tests/）、依赖、缓存、本地构建产物、
 *      私有 Agent 配置（.agents/）、skills-lock.json 等。
 *
 * 重要说明：
 *   本脚本不读取、不遵守 .npmignore 的规则，而是用下面写死的规则独立判断，
 *   这样才能发现 .npmignore / "files" 配置本身的错误。
 *
 * 特性：
 *   - 只做 dry-run，不会发布，也不会执行 npm 生命周期脚本（--ignore-scripts）。
 *   - 任一检查失败即抛出异常，进程以非 0 退出，可接入 CI 或 prepublishOnly。
 *
 * 用法：
 *   node scripts/check-package.mjs
 */

import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 获取根目录并以安全模式（dry-run）模拟 npm 打包，拦截真实发布动作并输出 JSON 格式的打包结构数据。
const root = fileURLToPath(new URL('../', import.meta.url))

// 必须完整发布的核心目录：模板、核心逻辑、CLI 入口
const REQUIRED_DIRS = ['templates', 'lib', 'bin']

// 本地产物、缓存、敏感文件：node_modules / dist / .vercel / .turbo、
// 本地缓存、.env*.local 和非目标包管理器锁文件。
// 既用于扫描磁盘时跳过，也用于检查包清单时判定错发。
const LOCAL_ARTIFACT
  = /(?:^|\/)(?:node_modules|\.pnpm|dist|\.vercel|\.turbo)(?:\/|$)|(?:^|\/)\.vitepress\/(?:cache|\.temp|config\/generated)(?:\/|$)|(?:^|\/)\.env(?:\.[^/]+)?\.local$|(?:^|\/)(?:yarn\.lock|package-lock\.json)$/

// 禁止出现在发布包中的目录和文件
const FORBIDDEN_DIR = /^(?:tests|docs|node_modules|\.agents)\//
const FORBIDDEN_FILES = new Set(['skills-lock.json'])

// ---------------------------------------------------------------------------
// 第 1 步：获取 npm 实际会打包的文件清单
// ---------------------------------------------------------------------------

// 获取 npm 实际会打包的文件清单。
// shell: true 是因为 Windows 上 npm 实际是 npm.cmd，不经 shell 无法 spawn。
const result = spawnSync('npm pack --dry-run --ignore-scripts --json', {
  cwd: root,
  shell: true,
  windowsHide: true,
  encoding: 'utf8',
  maxBuffer: 4 * 1024 * 1024,
})

if (result.status !== 0)
  throw new Error(result.stderr || result.stdout || result.error?.message || 'npm pack 执行失败')

let pack
try {
  ;[pack] = JSON.parse(result.stdout)
}
catch {
  throw new Error(`无法解析 npm pack 的 JSON 输出：\n${result.stdout}`)
}

/** npm 判定会被发布的文件路径集合（始终使用正斜杠，相对仓库根目录） */
const packed = new Set(pack.files.map(file => file.path))

// ---------------------------------------------------------------------------
// 第 2 步：扫描磁盘，生成"期望发布清单"
// ---------------------------------------------------------------------------

/** 磁盘上应当被发布的文件路径（相对仓库根目录，正斜杠） */
const expected = []

// 递归收集应发布的文件。跳过 .npmignore 文件本身（不读取其规则）和本地产物。
// 路径用 "/" 手动拼接，是为了与 npm 输出格式一致；访问磁盘时才用 path.join。
function visit(directory, prefix) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const relative = `${prefix}/${entry.name}`
    if (entry.name === '.npmignore' || LOCAL_ARTIFACT.test(relative))
      continue
    if (entry.isDirectory())
      visit(path.join(directory, entry.name), relative)
    else expected.push(relative)
  }
}

for (const directory of REQUIRED_DIRS) {
  const before = expected.length
  visit(path.join(root, directory), directory)
  // 保护：目录存在但为空，或内容全被规则过滤时，后面的比对会"空对空通过"，
  // 防止目录为空时"空对空"断言通过
  assert.ok(expected.length > before, `核心目录 ${directory}/ 中没有找到任何应发布的文件`)
}

// ---------------------------------------------------------------------------
// 第 3 步：断言
// ---------------------------------------------------------------------------

// 防漏发：期望发布的文件必须全部出现在 npm 包中
const missing = expected.filter(file => !packed.has(file)).sort()
assert.deepEqual(missing, [], `发布包遗漏模板或生成器文件：\n${missing.join('\n')}`)

// 防错发：包中不得出现测试、旧模板、依赖、缓存、私有配置等
const forbidden = [...packed]
  .filter(file => FORBIDDEN_DIR.test(file) || FORBIDDEN_FILES.has(file) || LOCAL_ARTIFACT.test(file))
  .sort()
assert.deepEqual(forbidden, [], `发布包包含开发技能、本地测试、依赖或缓存：\n${forbidden.join('\n')}`)

console.log(`发布包预检通过：${packed.size} 个文件，模板与生成器完整；未执行发布。`)
