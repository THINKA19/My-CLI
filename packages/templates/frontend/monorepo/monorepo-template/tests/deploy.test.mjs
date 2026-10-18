import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { saveTarget, listTargets, removeTarget } from '../lib/deploy/targets.js'
import { runTarget } from '../templates/features/deploy/shared/scripts/deploy/run.js'
import { platforms } from '../lib/options.js'
const cli = fileURLToPath(new URL('../bin/index.js', import.meta.url))
function repo(fn) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'deploy-lifecycle-'))
  const root = path.join(temp, 'repo')
  try {
    const r = spawnSync(process.execPath, [cli, root, '--yes'], { encoding: 'utf8' })
    assert.equal(r.status, 0, r.stderr)
    return fn(root)
  }
  finally { fs.rmSync(temp, { recursive: true, force: true }) }
}
const target = (platform, name = platform) => ({ version: 1, name, platform, environment: 'production', app: 'apps/frontend/web', build: 'node --version', ...(['registry', 'server'].includes(platform) ? { image: 'registry.example.com/team/web:latest' } : { output: 'apps/frontend/web/dist' }), ...(platform === 'registry' ? { dockerfile: 'apps/frontend/web/Dockerfile', context: '.' } : {}), ...(platform === 'server' ? { container: 'web', runArgs: ['-p', '8080:80'] } : {}), ...(platform === 'cloudflare' ? { project: 'web' } : {}), ...(['oss','cos'].includes(platform) ? { region: 'region', bucket: 'bucket' } : {}) })
test('all platform targets coexist and lifecycle preserves unrelated files', () => repo(root => {
  const pkgFile = path.join(root, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgFile)); pkg.scripts.custom = 'echo custom'; fs.writeFileSync(pkgFile, JSON.stringify(pkg))
  for (const platform of platforms) saveTarget(root, target(platform))
  assert.equal(listTargets(root).length, 7)
  assert.ok(fs.existsSync(path.join(root, 'eslint.config.js')))
  assert.ok(!fs.existsSync(path.join(root, 'base')))
  assert.equal(JSON.parse(fs.readFileSync(pkgFile)).scripts.custom, 'echo custom')
  const t = target('oss'); t.prefix = 'web'; saveTarget(root, t, true)
  assert.equal(listTargets(root).find(x => x.name === 'oss').prefix, 'web')
  const wf = path.join(root, '.github/workflows/deploy-oss.yml')
  fs.appendFileSync(wf, '# user edit\n')
  assert.throws(() => saveTarget(root, t, true), /拒绝覆盖/)
  assert.throws(() => removeTarget(root, 'oss'), /拒绝删除/)
  assert.throws(() => saveTarget(root, target('github-pages', 'second-pages')), /Pages/)
  removeTarget(root, 'cos')
  assert.equal(listTargets(root).length, 6)
  assert.ok(!fs.existsSync(path.join(root, '.github/workflows/deploy-cos.yml')))
  assert.ok(fs.existsSync(path.join(root, '.github/workflows/ci.yml')))
}))
test('invalid config does not enable deployment or overwrite scripts', () => repo(root => {
  assert.throws(() => saveTarget(root, {...target('oss'), output: '../outside'}), /超出/)
  assert.throws(() => saveTarget(root, {...target('oss'), token: 'secret'}), /未知/)
  assert.ok(!fs.existsSync(path.join(root, 'deploy')))
  const file = path.join(root, 'package.json'); const pkg = JSON.parse(fs.readFileSync(file)); pkg.scripts.deploy = 'custom'; fs.writeFileSync(file, JSON.stringify(pkg))
  assert.throws(() => saveTarget(root, target('oss')), /已有 deploy/)
  assert.ok(!fs.existsSync(path.join(root, 'deploy/targets/oss.json')))
}))
test('CLI adds targets to existing repos and dry-run never builds', () => repo(root => {
  const config = path.join(root, 'target.json')
  fs.writeFileSync(config, JSON.stringify({...target('oss'), build: 'this-command-must-never-run'}))
  let r = spawnSync(process.execPath, [cli, 'deploy', 'add', '--config', config], { cwd: root, encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  r = spawnSync(process.execPath, ['deploy/manage.mjs', 'run', 'oss', '--dry-run'], { cwd: root, encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  r = spawnSync(process.execPath, ['deploy/manage.mjs', 'run', 'oss'], { cwd: root, encoding: 'utf8' })
  assert.equal(r.status, 1); assert.match(r.stderr, /应用尚未创建/)
}))
test('initial config uses same lifecycle and includes only selected SDK', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'deploy-initial-'))
  try {
    const config = path.join(temp, 'target.json'); fs.writeFileSync(config, JSON.stringify(target('cos')))
    const root = path.join(temp, 'repo')
    const r = spawnSync(process.execPath, [cli, root, '--yes', '--deploy-config=' + config], { encoding: 'utf8' })
    assert.equal(r.status, 0, r.stderr)
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json')))
    assert.ok(pkg.devDependencies['cos-nodejs-sdk-v5']); assert.ok(!pkg.devDependencies['ali-oss'])
    assert.equal(listTargets(root).length, 1)
  }
  finally { fs.rmSync(temp, { recursive: true, force: true }) }
})

test('local build uses repository root and checks selected output', async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'deploy-build-'))
  const root = path.join(temp, 'repo')
  const previous = process.env.GITHUB_ACTIONS
  try {
    const created = spawnSync(process.execPath, [cli, root, '--yes'], { encoding: 'utf8' })
    assert.equal(created.status, 0, created.stderr)
    const app = path.join(root, 'apps/frontend/web')
    fs.mkdirSync(app, { recursive: true })
    fs.writeFileSync(path.join(root, 'build.mjs'), "import fs from 'node:fs';fs.mkdirSync('apps/frontend/web/dist',{recursive:true});fs.writeFileSync('apps/frontend/web/dist/index.html','hello')")
    saveTarget(root, {...target('github-pages'), build: 'node build.mjs'})
    process.env.GITHUB_ACTIONS = 'true'
    await runTarget(root, 'github-pages')
    assert.equal(fs.readFileSync(path.join(app, 'dist/index.html'), 'utf8'), 'hello')
    saveTarget(root, {...target('github-pages'), build: 'node --version', output: 'apps/frontend/web/missing'}, true)
    await assert.rejects(runTarget(root, 'github-pages'), /产物目录/)
  }
  finally {
    if (previous === undefined) delete process.env.GITHUB_ACTIONS
    else process.env.GITHUB_ACTIONS = previous
    fs.rmSync(temp, { recursive: true, force: true })
  }
})

test('push triggers and CRLF checkout preserve managed workflow ownership', () => repo(root => {
  saveTarget(root, {...target('oss'), trigger: 'push', branch: 'main', paths: ['apps/frontend/web/**', 'packages/**', 'package.json']})
  const wf = path.join(root, '.github/workflows/deploy-oss.yml')
  const text = fs.readFileSync(wf, 'utf8')
  assert.match(text, /push:/); assert.match(text, /branches:/); assert.match(text, /packages\/\*\*/)
  fs.writeFileSync(wf, text.replaceAll('\n', '\r\n'))
  saveTarget(root, {...target('oss'), trigger: 'manual'}, true)
  assert.doesNotMatch(fs.readFileSync(wf, 'utf8'), /  push:/)
  removeTarget(root, 'oss')
}))

test('misspelled execution flags fail instead of deploying', () => repo(root => {
  saveTarget(root, target('oss'))
  const r = spawnSync(process.execPath, ['deploy/manage.mjs', 'run', 'oss', '--dry-rnu'], { cwd: root, encoding: 'utf8' })
  assert.equal(r.status, 1)
  assert.match(r.stderr, /参数错误/)
}))

test('generated manager adds another platform offline without copying unrelated active scripts', () => repo(root => {
  saveTarget(root, target('oss'))
  assert.ok(fs.existsSync(path.join(root, 'scripts/deploy/oss.js')))
  assert.ok(!fs.existsSync(path.join(root, 'scripts/deploy/cos.js')))
  assert.ok(fs.existsSync(path.join(root, 'scripts/deploy/upload-utils.js')))
  const config = path.join(root, 'cos.json'); fs.writeFileSync(config, JSON.stringify(target('cos')))
  let r = spawnSync(process.execPath, ['deploy/manage.mjs', 'add', '--config', config], { cwd: root, encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  assert.ok(fs.existsSync(path.join(root, 'scripts/deploy/cos.js')))
  assert.ok(!fs.existsSync(path.join(root, 'scripts/deploy/server.js')))
  assert.ok(fs.readFileSync(path.join(root, 'deploy/manage.mjs'), 'utf8').split('\n').length < 15)
  r = spawnSync(process.execPath, ['deploy/manage.mjs', 'edit', 'cos', '--config', config], { cwd: root, encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  fs.appendFileSync(path.join(root, 'scripts/deploy/oss.js'), '// user customization\n')
  const serverConfig = path.join(root, 'server.json'); fs.writeFileSync(serverConfig, JSON.stringify(target('server')))
  r = spawnSync(process.execPath, ['deploy/manage.mjs', 'add', '--config', serverConfig], { cwd: root, encoding: 'utf8' })
  // Unrelated platform customizations are preserved, not regenerated.
  assert.equal(r.status, 0, r.stderr)
  assert.match(fs.readFileSync(path.join(root, 'scripts/deploy/oss.js'), 'utf8'), /user customization/)
}))

test('normalized output paths cannot include application sources', () => repo(root => {
  for (const output of ['apps/frontend/web/.', 'apps/frontend', 'apps']) {
    assert.throws(() => saveTarget(root, {...target('oss'), output}), /源码目录/)
  }
  assert.ok(!fs.existsSync(path.join(root, 'deploy')))
}))

test('empty output trees and overlapping Vercel staging are rejected without deleting files', () => repo(root => {
  saveTarget(root, target('vercel'))
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict'
    import fs from 'node:fs'
    import path from 'node:path'
    import { verifyOutput } from './scripts/deploy/verify-output.js'
    import { prepareVercel } from './scripts/deploy/prepare-vercel.js'
    const root = process.cwd()
    fs.mkdirSync('apps/frontend/web/dist/empty', {recursive:true})
    assert.throws(() => verifyOutput(root, {output:'apps/frontend/web/dist'}), /不包含任何文件/)
    fs.mkdirSync('.deploy-output/vercel/.vercel/output', {recursive:true})
    fs.writeFileSync('.deploy-output/vercel/.vercel/output/keep.txt', 'keep')
    assert.throws(() => prepareVercel(root, {name:'vercel'}, path.join(root,'.deploy-output')), /重叠/)
    assert.equal(fs.readFileSync('.deploy-output/vercel/.vercel/output/keep.txt','utf8'),'keep')
  `], {cwd:root, encoding:'utf8'})
  assert.equal(result.status, 0, result.stdout + result.stderr)
}))
