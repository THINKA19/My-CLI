import path from 'node:path'

export async function uploadAll(target, output, files, upload) {
  const t = target
  files.sort((a, b) => Number(a.endsWith('.html')) - Number(b.endsWith('.html')))
  const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.mjs': 'application/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' }
  for (const relative of files) {
    await upload(path.posix.join(t.prefix || '', relative), path.join(output, relative), { 'Content-Type': mime[path.extname(relative)] || 'application/octet-stream', 'Cache-Control': relative.endsWith('.html') ? 'no-cache' : 'public, max-age=3600' })
  }
  console.log(`已上传 ${files.length} 个文件；未删除远端旧文件。`)
}
