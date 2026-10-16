import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const result = spawnSync('npm pack --dry-run --ignore-scripts --json', { cwd: root, shell: true, windowsHide: true, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 })
if (result.status !== 0)
  throw new Error(result.stderr || result.stdout || result.error?.message)
const [pack] = JSON.parse(result.stdout)
const packed = new Set(pack.files.map(file => file.path))
const expected = []
const localArtifact = /(?:^|\/)(?:node_modules|\.pnpm|dist|\.vercel|\.turbo)(?:\/|$)|(?:^|\/)\.vitepress\/(?:cache|\.temp|config\/generated)(?:\/|$)|(?:^|\/)\.env(?:\.[^/]+)?\.local$|(?:^|\/)(?:yarn\.lock|package-lock\.json)$/
function visit(directory, prefix) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const relative = `${prefix}/${entry.name}`
    if (entry.name === '.npmignore' || localArtifact.test(relative))
      continue
    if (entry.isDirectory())
      visit(path.join(directory, entry.name), relative)
    else expected.push(relative)
  }
}
for (const directory of ['templates', 'lib', 'bin']) visit(path.join(root, directory), directory)
const missing = expected.filter(file => !packed.has(file))
assert.deepEqual(missing, [], '发布包遗漏模板或生成器文件')
assert.ok([...packed].every(file => !/^(?:template|tests|node_modules|\.agents)\//.test(file) && file !== 'skills-lock.json' && !localArtifact.test(file)), '发布包包含开发技能、旧模板、本地测试、依赖或缓存')
console.log(`发布包预检通过：${packed.size} 个文件，模板与生成器完整；未执行发布。`)
