import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

const base = process.env.VITE_BASE || '/'
const siteUrl = process.env.VITE_SITE_URL
const root = path.resolve('dist')
let assetCount = 0
for (const page of ['index.html', 'zh/index.html', 'en/index.html', 'vi/index.html', '404.html']) {
  const html = await fs.readFile(path.join(root, page), 'utf8')
  assert.ok(html.length, `${page} 不能为空`)
  for (const match of html.matchAll(/(?:src|href)="([^"#?]*\/assets\/[^"?#]+)(?:[?#][^"]*)?"/g)) {
    const url = match[1]
    if (/^https?:/.test(url))
      continue
    assert.ok(url.startsWith(base), `${page} 资源路径与 base 不一致: ${url}`)
    const file = path.resolve(root, url.slice(base.length))
    assert.ok(file.startsWith(`${root}${path.sep}`), '资源路径越界')
    await fs.access(file)
    assetCount++
  }
}
assert.ok(assetCount > 0, '页面必须引用实际构建资源')
const sitemap = await fs.readFile(path.join(root, 'sitemap.xml'), 'utf8')
assert.ok(siteUrl, '验证 sitemap 需要 VITE_SITE_URL')
for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const url = new URL(match[1])
  assert.equal(url.origin, new URL(siteUrl).origin, 'sitemap 域名不匹配')
  assert.ok(url.pathname.startsWith(base), 'sitemap 路径不匹配')
}
assert.ok(sitemap.includes('<loc>'), 'sitemap 必须包含页面')
console.log(`静态产物验证通过：5 个页面，${assetCount} 个资源引用及 sitemap；未验证云端托管`)
