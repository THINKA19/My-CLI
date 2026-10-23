/* eslint-disable test/no-import-node-test -- CLI tests use the Node.js runner */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { featureLabels } from '../lib/features.js'
import { createPlan } from '../lib/generate.js'
import { parseArgs } from '../lib/options.js'

const cli = fileURLToPath(new URL('../bin/index.js', import.meta.url))
const optional = ['theme', 'i18n', 'tools', 'analyze', 'diagnostics', 'deployment']
for (let mask = 0; mask < 64; mask++) {
  test(`common module combination ${mask}`, () => {
    const features = optional.filter((_, i) => mask & (1 << i))
    const plan = createPlan({ features }, path.join(os.tmpdir(), `common-plan-${process.pid}`))
    const pkg = JSON.parse(plan.files.get('package.json'))
    for (const feature of ['theme', 'i18n', 'tools', 'diagnostics']) {
      assert.equal([...plan.files.keys()].some(p => p.startsWith(`src/features/${feature}/`)), features.includes(feature))
      assert.equal([...plan.files.keys()].some(p => p.includes('/__tests__/')), false)
    }
    assert.equal(Boolean(pkg.dependencies['vue-i18n']), features.includes('i18n'))
    assert.equal(Boolean(pkg.devDependencies['rollup-plugin-visualizer']), features.includes('analyze'))
    assert.equal(Boolean(pkg.scripts.analyze), features.includes('analyze'))
    assert.equal(plan.files.has('deploy/nginx.conf'), features.includes('deployment'))
    assert.equal(plan.files.has('src/app/FeatureShell.vue'), features.includes('theme'))
    assert.equal(plan.files.has('src/app/FeatureDemos.vue'), features.some(feature => ['theme', 'i18n', 'tools', 'diagnostics'].includes(feature)))
    assert.equal(plan.files.has('src/app/plugins.ts'), features.some(feature => ['theme', 'i18n', 'diagnostics'].includes(feature)))
    assert.equal(plan.files.has('config/plugins.ts'), features.includes('analyze'))
    const main = plan.files.get('src/app/plugins.ts')?.toString() || ''
    for (const feature of ['theme', 'i18n', 'diagnostics'])
      assert.equal(main.includes(`@/features/${feature}/setup`), features.includes(feature))
  })
}
test('all features, platforms and HTTP libraries combine without conflicts', () => {
  for (const type of ['admin', 'mobile']) {
    for (const http of ['axios', 'alova']) {
      const plan = createPlan({ type, http, features: Object.keys(featureLabels) }, path.join(os.tmpdir(), `common-full-${process.pid}`))
      const pkg = JSON.parse(plan.files.get('package.json'))
      assert.ok(pkg.scripts.analyze)
      assert.ok(plan.files.has('src/features/tools/__tests__/tools.spec.ts'))
      assert.ok(plan.files.has('src/features/theme/__tests__/theme.spec.ts'))
      assert.ok(plan.files.get('src/ui/styles/platform.css').toString().includes(type === 'mobile' ? 'safe-area-inset' : 'min-width: 768px'))
      assert.ok(plan.files.get('src/app/router/index.ts').toString().includes(':pathMatch(.*)*'))
      assert.ok(plan.files.get('src/http/client.ts').toString().includes('environment.apiBase'))
      assert.ok(plan.files.get('src/http/example.ts').toString().includes('publicUrl'))
    }
  }
})
test('preset overrides and dry-run never create or install', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'common-config-'))
  try {
    const config = path.join(dir, 'preset.json')
    const target = path.join(dir, 'preview')
    fs.writeFileSync(config, JSON.stringify({ type: 'mobile', http: 'alova', features: ['theme'], install: true }))
    const args = [target, `--config=${config}`, '--http=axios', '--dry-run']
    const parsed = parseArgs(args)
    assert.equal(parsed.options.ui, 'vant')
    assert.equal(parsed.options.http, 'axios')
    const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
    assert.ok(result.stdout.includes('未创建项目'))
    assert.equal(fs.existsSync(target), false)
    assert.deepEqual(parseArgs(['--features=all']).options.features, Object.keys(featureLabels))
    fs.writeFileSync(config, JSON.stringify({ unknown: true }))
    assert.throws(() => parseArgs([`--config=${config}`]), /未知配置字段/)
    assert.throws(() => parseArgs([`--config=${config}`, `--config=${config}`]), /只能指定一次/)
  }
  finally { fs.rmSync(dir, { recursive: true, force: true }) }
})

test('minimal output has no placeholders or imports of omitted optional entries', () => {
  const plan = createPlan({ location: 'clean-app', features: ['unit-test'] }, path.join(os.tmpdir(), `clean-plan-${process.pid}`))
  for (const [file, content] of plan.files) {
    assert.ok(!file.endsWith('.gitkeep'), file)
    assert.ok(content.toString().trim().length > 0, file)
  }
  for (const file of ['src/app/FeatureShell.vue', 'src/app/FeatureDemos.vue', 'src/app/plugins.ts', 'config/plugins.ts'])
    assert.equal(plan.files.has(file), false, file)
  for (const file of ['src/app/main.ts', 'src/app/App.vue', 'src/app/pages/HomeView.vue', 'vite.config.ts', 'src/components/__tests__/HomeView.spec.ts'])
    assert.doesNotMatch(plan.files.get(file).toString(), /installFeatures|FeatureShell|FeatureDemos|featurePlugins/)
  assert.match(plan.files.get('README.md').toString(), /^# clean-app\n/)
})
test('preset values are type checked before creating or installing', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'invalid-preset-'))
  const config = path.join(dir, 'config.json')
  try {
    for (const preset of [{ install: 'false' }, { location: 1 }, { location: null }]) {
      fs.writeFileSync(config, JSON.stringify(preset))
      assert.throws(() => parseArgs([`--config=${config}`]), /布尔值|字符串/)
    }
  }
  finally { fs.rmSync(dir, { recursive: true, force: true }) }
})
