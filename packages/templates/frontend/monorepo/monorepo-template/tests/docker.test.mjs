import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { createPlan, writePlan } from '../lib/generate.js'
import { collectOptions } from '../lib/prompts.js'
import { defaultDockerApp } from '../lib/docker/options.js'

function fixture(fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'docker-options-'))
  try { return fn(root) }
  finally { fs.rmSync(root, { recursive: true, force: true }) }
}
for (let bits = 0; bits < 8; bits++) {
  const features = ['dev', 'image', 'compose'].filter((_, i) => bits & (1 << i))
  test(`Docker selection: ${features.join(',') || 'none'}`, () => fixture(root => {
    const apps = features.some(f => f !== 'compose') ? [defaultDockerApp()] : []
    const services = features.includes('compose') && !apps.length ? [{ name: 'cache', source: 'image', image: 'redis:7', ports: ['6379:6379'], volumes: ['cache-data:/data'] }] : []
    const plan = createPlan({ location: 'repo', docker: { features, apps, services } }, root)
    const has = file => plan.files.has(file)
    assert.equal(has('.dockerignore'), features.length > 0)
    assert.equal(has('docker/web/Dockerfile'), apps.length > 0)
    assert.equal(has('docker/compose.yml'), features.includes('compose'))
    assert.equal(has('docker/compose.dev.yml'), features.includes('compose') && features.includes('dev'))
    assert.equal(has('docker/compose.prod.yml'), features.includes('compose') && features.includes('image'))
    const pkg = JSON.parse(plan.files.get('package.json'))
    assert.equal(Boolean(pkg.scripts['docker:dev:web']), features.includes('dev'))
    assert.equal(Boolean(pkg.scripts['docker:run:web']), features.includes('image'))
    if (apps.length) {
      const dockerfile = String(plan.files.get('docker/web/Dockerfile'))
      assert.equal(dockerfile.includes('AS dev'), features.includes('dev'))
      assert.equal(dockerfile.includes('AS prod'), features.includes('image'))
      assert.ok(!dockerfile.includes('__'))
    }
    if (services.length) {
      const text = String(plan.files.get('docker/compose.yml'))
      assert.match(text, /image: redis:7/)
      assert.match(text, /volumes:\n  cache-data: \{\}/)
      assert.ok(!has('scripts/docker/run.mjs'))
    }
    writePlan(plan)
    assert.ok(!fs.existsSync(path.join(root, 'repo/templates')))
  }))
}
test('existing Dockerfile Compose context is relative to the Dockerfile build context', () => fixture(root => {
  const plan = createPlan({ location: 'repo', docker: { features: ['compose'], apps: [], services: [{ name: 'api', source: 'dockerfile', context: 'apps/backend/api', dockerfile: 'apps/backend/api/Dockerfile', ports: ['3000:3000'] }] } }, root)
  assert.match(String(plan.files.get('docker/compose.yml')), /context: ..\/apps\/backend\/api/)
  assert.match(String(plan.files.get('docker/compose.yml')), /dockerfile: Dockerfile/)
}))
test('Docker invalid selections and duplicate apps fail before creating files', () => fixture(root => {
  for (const docker of [
    { features: ['unknown'] },
    { features: ['compose'], apps: [], services: [] },
    { features: ['dev'], apps: [{...defaultDockerApp(), devPort:0}] },
    { features: ['dev'], apps: [defaultDockerApp(), defaultDockerApp()] },
  ]) assert.throws(() => createPlan({location:'repo',docker}, root))
  assert.ok(!fs.existsSync(path.join(root,'repo')))
}))
test('creation has two multi-selects and no deployment enable gates', async () => {
  const seen = []
  const result = await collectOptions({}, async q => {
    seen.push(q)
    if (q.title === '项目创建位置') return ''
    if (q.multiple) return []
    if (q.title === '是否立即安装依赖？') return false
    if (q.title === '确认配置') return 'create'
    throw new Error(`Unexpected question ${q.title}`)
  })
  assert.equal(result.location, '.')
  assert.equal(result.deploy, false)
  assert.deepEqual(result.targets, [])
  assert.deepEqual(result.docker.features, [])
  assert.equal(seen.filter(q=>q.multiple).length,2)
  assert.ok(!seen.some(q=>/启用部署|现在添加/.test(q.title)))
})
test('platform multi-selection creates independent targets without repeating the platform question', async () => {
  const seen = []
  const result = await collectOptions({}, async q => {
    seen.push(q)
    if (q.title === '项目创建位置') return 'my-repo'
    if (q.title === '选择 Docker 配置') return []
    if (q.title === '选择部署平台') return ['oss','cos']
    if (q.title === '存储桶') return 'example-bucket'
    if (q.title === '区域') return 'example-region'
    if (q.title === '是否立即安装依赖？') return false
    if (q.title === '确认配置') return 'create'
    if (q.title === '部署平台') throw new Error('Must not ask platform twice')
    return q.initial ?? q.defaultValue
  })
  assert.deepEqual(result.targets.map(t=>t.platform),['oss','cos'])
  assert.equal(new Set(result.targets.map(t=>t.name)).size,2)
  assert.equal(result.targets[1].app,result.targets[0].app)
  assert.ok(result.deploy)
})
test('compose-only interactive choice asks for an existing service, not an application', async () => {
  const result = await collectOptions({}, async q => {
    if (q.title === '项目创建位置') return 'my-repo'
    if (q.title === '选择 Docker 配置') return ['compose']
    if (q.title === '编排服务来源') return 'image'
    if (q.title === '编排服务名称') return 'cache'
    if (q.title === '镜像地址及标签') return 'redis:7'
    if (q.title === '选择部署平台') return []
    if (q.title === '继续配置另一个编排服务？' || q.title === '是否立即安装依赖？') return false
    if (q.title === '确认配置') return 'create'
    if (q.title === '容器应用类型') throw new Error('Must not require a generated application')
    return q.initial ?? q.defaultValue ?? ''
  })
  assert.deepEqual(result.docker.apps,[])
  assert.equal(result.docker.services[0].image,'redis:7')
})

test('custom Node app paths and commands are used in all selected Docker stages', async () => {
  const options = await collectOptions({}, async q => {
    if (q.title === '项目创建位置') return 'my-repo'
    if (q.title === '选择 Docker 配置') return ['dev','image','compose']
    if (q.title === '容器应用类型') return 'node'
    if (q.title === '容器应用名称（唯一）') return 'service'
    if (q.title === '应用目录（相对仓库根）') return 'apps/backend/service'
    if (q.title === '应用包名（用于命令默认值）') return '@repo/service'
    if (q.title === '选择部署平台') return []
    if (q.title === '确认配置') return 'create'
    if (q.title === '继续配置另一个应用容器？' || q.title === '添加引用已有镜像或 Dockerfile 的编排服务？' || q.title === '是否立即安装依赖？') return false
    if (q.title.startsWith('静态产物目录')) throw new Error('Node app must not require static output')
    return q.initial ?? q.defaultValue
  })
  fixture(root => {
    const plan = createPlan(options, root)
    const dockerfile = String(plan.files.get('docker/service/Dockerfile'))
    assert.match(dockerfile, /pnpm --filter @repo\/service\.\.\. build/)
    assert.match(dockerfile, /node apps\/backend\/service\/dist\/index.js/)
    assert.ok(!plan.files.has('docker/service/nginx.conf'))
    assert.match(String(plan.files.get('docker/compose.dev.yml')), /apps\/backend\/service\/node_modules/)
  })
})
