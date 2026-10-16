import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const distDir = fileURLToPath(new URL('../../dist/', import.meta.url))

export function requireEnv(names) {
  const missing = names.filter(name => !process.env[name])
  if (missing.length)
    throw new Error(`缺少环境变量: ${missing.join(', ')}`)
}

export function getAllFiles(dir = distDir, prefix = '', relative = '') {
  if (!fs.existsSync(dir))
    throw new Error('dist 不存在，请先运行 pnpm build:deploy')
  const files = []
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const localPath = path.join(dir, item.name)
    const key = path.posix.join(relative, item.name)
    if (item.isDirectory())
      files.push(...getAllFiles(localPath, prefix, key))
    else files.push({ localPath, remotePath: path.posix.join(prefix.replace(/^\/+|\/+$/g, ''), key) })
  }
  return files
}

export function headersFor(file) {
  const ext = path.extname(file.remotePath).toLowerCase()
  const mime = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.xml': 'application/xml',
    '.txt': 'text/plain',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
  }
  return {
    'Content-Type': mime[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html'
      ? 'no-cache'
      : /(?:^|\/)assets\//.test(file.remotePath)
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=3600',
  }
}

export async function uploadAll(upload, prefix = '') {
  const files = getAllFiles(distDir, prefix)
  // 先完成资源上传，再发布 HTML；任何上传失败立即停止，不删除远端文件。
  files.sort((a, b) => Number(a.remotePath.endsWith('.html')) - Number(b.remotePath.endsWith('.html')))
  if (!files.length)
    throw new Error('dist 为空')
  for (const file of files) {
    try {
      await upload(file, headersFor(file))
      console.log(`上传成功: ${file.remotePath}`)
    }
    catch (error) {
      throw new Error(`上传失败，已停止发布: ${file.remotePath}: ${error.message}`, { cause: error })
    }
  }
  console.log(`已上传 ${files.length} 个文件`)
}
