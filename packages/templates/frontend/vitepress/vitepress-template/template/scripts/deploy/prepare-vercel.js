import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { distDir, getAllFiles } from './upload-utils.js'

// Vercel Build Output API：只上传已构建的静态文件。
const output = fileURLToPath(new URL('../../.vercel/output/', import.meta.url))
const overrides = {}
for (const file of getAllFiles()) {
  if (file.remotePath.endsWith('.html') && path.posix.basename(file.remotePath) !== 'index.html' && file.remotePath !== '404.html')
    overrides[file.remotePath] = { path: file.remotePath.slice(0, -5) }
}
// 仅清理本脚本的静态产物，避免删除过的页面被再次发布；拒绝目录链接。
const vercelDir = path.dirname(output.replace(/[\\/]$/, ''))
if (fs.existsSync(vercelDir) && fs.lstatSync(vercelDir).isSymbolicLink())
  throw new Error('.vercel 不能是目录链接')
if (fs.existsSync(output) && fs.lstatSync(output).isSymbolicLink())
  throw new Error('.vercel/output 不能是目录链接')
const staticDir = path.resolve(output, 'static')
if (!staticDir.startsWith(path.resolve(output) + path.sep))
  throw new Error('静态产物目录超出输出范围')
fs.rmSync(staticDir, { recursive: true, force: true })
fs.mkdirSync(output, { recursive: true })
fs.cpSync(distDir, staticDir, { recursive: true })
fs.writeFileSync(path.join(output, 'config.json'), JSON.stringify({
  version: 3,
  overrides,
  routes: [
    { src: '/assets/(.*)', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }, continue: true },
    { handle: 'filesystem' },
    { src: '/.*', dest: '/404.html', status: 404 },
  ],
}, null, 2))
