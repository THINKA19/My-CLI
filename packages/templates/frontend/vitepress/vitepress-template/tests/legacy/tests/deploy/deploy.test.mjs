/* eslint-disable test/no-import-node-test -- 使用 Node.js 内置测试，不连接云平台。 */
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { it } from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

const root = fileURLToPath(new URL('../../', import.meta.url))
const run = promisify(execFile)
const cli = path.join(root, '../bin/index.js')
const hasCli = await fs.access(cli).then(() => true, () => false)

async function withFixture(test) {
  const fixture = await fs.mkdtemp(path.join(os.tmpdir(), 'vitepress-deploy-'))
  try {
    await fs.mkdir(path.join(fixture, 'scripts/deploy'), { recursive: true })
    await fs.mkdir(path.join(fixture, 'dist/assets'), { recursive: true })
    await fs.writeFile(path.join(fixture, 'package.json'), '{"type":"module"}')
    for (const file of ['upload-utils.js', 'prepare-vercel.js'])
      await fs.copyFile(path.join(root, 'scripts/deploy', file), path.join(fixture, 'scripts/deploy', file))
    await fs.writeFile(path.join(fixture, 'dist/assets/app.hash.js'), 'export {}')
    await fs.writeFile(path.join(fixture, 'dist/index.html'), '<h1>Home</h1>')
    await fs.writeFile(path.join(fixture, 'dist/404.html'), '<h1>Not found</h1>')
    await test(fixture)
  }
  finally {
    // 只清理本测试创建的临时目录，确认绝对路径位于系统临时目录内。
    assert.equal(path.dirname(path.resolve(fixture)), path.resolve(os.tmpdir()))
    assert.ok(path.basename(fixture).startsWith('vitepress-deploy-'))
    await fs.rm(fixture, { recursive: true, force: true })
  }
}

it('资源上传失败时不发布 HTML，成功时资源先于页面上传', async () => {
  await withFixture(async (fixture) => {
    const { uploadAll } = await import(pathToFileURL(path.join(fixture, 'scripts/deploy/upload-utils.js')).href)
    const failedCalls = []
    await assert.rejects(uploadAll(async (file) => {
      failedCalls.push(file.remotePath)
      throw new Error('simulated upload failure')
    }), /已停止发布/)
    assert.ok(failedCalls.length)
    assert.ok(failedCalls.every(file => !file.endsWith('.html')))
    const calls = []
    await uploadAll(async (file, headers) => {
      calls.push(file.remotePath)
      assert.ok(headers['Content-Type'])
      assert.ok(file.remotePath.startsWith('docs/'))
    }, 'docs')
    assert.ok(calls[0].endsWith('.js'))
    assert.ok(calls.slice(1).every(file => file.endsWith('.html')))
  })
})

it('Vercel 连续准备产物会清理已删除页面，并输出 cleanUrls 和真实 404 路由', async () => {
  await withFixture(async (fixture) => {
    const command = path.join(fixture, 'scripts/deploy/prepare-vercel.js')
    const oldPage = path.join(fixture, 'dist/old.html')
    await fs.writeFile(oldPage, 'Old page')
    await run(process.execPath, [command], { cwd: fixture, windowsHide: true })
    await fs.unlink(oldPage)
    await fs.writeFile(path.join(fixture, 'dist/new.html'), 'New page')
    await run(process.execPath, [command], { cwd: fixture, windowsHide: true })
    const output = path.join(fixture, '.vercel/output')
    await assert.rejects(fs.access(path.join(output, 'static/old.html')))
    assert.equal(await fs.readFile(path.join(output, 'static/new.html'), 'utf8'), 'New page')
    const config = JSON.parse(await fs.readFile(path.join(output, 'config.json'), 'utf8'))
    assert.deepEqual(config.overrides['new.html'], { path: 'new' })
    assert.equal(config.overrides['old.html'], undefined)
    assert.equal(config.routes.at(-1).status, 404)
  })
})

// 独立生成项目不包含脚手架 CLI，此项只在脚手架仓库验证。
it('CLI 生成项目提供锁文件和部署命令，菜单仍由构建步骤生成', { skip: !hasCli }, async () => {
  await withFixture(async (fixture) => {
    const destination = path.join(fixture, 'docs-project')
    await run(process.execPath, [cli, destination], { cwd: fixture, windowsHide: true })
    await fs.access(path.join(destination, 'pnpm-lock.yaml'))
    await fs.access(path.join(destination, 'docker/Dockerfile'))
    await fs.access(path.join(destination, '.github/workflows/deploy-gh-pages.yml'))
    assert.deepEqual(await fs.readdir(path.join(destination, '.vitepress/config/generated')), [])
    const pkg = JSON.parse(await fs.readFile(path.join(destination, 'package.json'), 'utf8'))
    assert.equal(pkg.name, 'docs-project')
    assert.equal(pkg.scripts['build:deploy'], 'pnpm menus:generate && node scripts/deploy/build.js')
  })
})

it('部署构建拒绝无法映射到静态目录的 base', async () => {
  for (const base of ['/docs/../', '/docs//', '/docs%2f/', '/docs?preview/']) {
    await assert.rejects(run(process.execPath, [path.join(root, 'scripts/deploy/build.js')], {
      cwd: root,
      windowsHide: true,
      env: { ...process.env, VITE_BASE: base, VITE_SITE_URL: 'https://example.com' },
    }), /规范的站内目录路径/)
  }
})
