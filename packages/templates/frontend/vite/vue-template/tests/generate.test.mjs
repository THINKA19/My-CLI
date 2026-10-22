import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
// eslint-disable-next-line test/prefer-vitest -- CLI tests run with node --test
import test from 'node:test'
import { createPlan, writePlan } from '../lib/generate.js'
import { parseArgs } from '../lib/options.js'
import { collectOptions } from '../lib/prompts.js'

const cli = fileURLToPath(new URL('../bin/index.js', import.meta.url))
const run = args => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' })
const choices = ['code-quality', 'unit-test', 'e2e', 'jsx']
for (let mask = 0; mask < 16; mask++) {
  const features = choices.filter((_, index) => mask & (1 << index))
  test(`generation: ${features.join(',') || 'none'}`, () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'vue-template-'))
    try {
      const target = path.join(temp, 'my-vue-app')
      const result = run([target, '--yes', `--features=${features.join(',')}`])
      assert.equal(result.status, 0, result.stderr)
      const has = file => fs.existsSync(path.join(target, file))
      const read = file => fs.readFileSync(path.join(target, file), 'utf8')
      const pkg = JSON.parse(read('package.json'))
      const quality = features.includes('code-quality')
      const unit = features.includes('unit-test')
      const e2e = features.includes('e2e')
      assert.equal(pkg.name, 'my-vue-app')
      assert.equal(Boolean(pkg.devDependencies['@vitejs/plugin-vue-jsx']), features.includes('jsx'))
      assert.equal(read('vite.config.ts').includes('vueJsx()'), features.includes('jsx'))
      assert.equal(read('tsconfig.app.json').includes('"jsxImportSource": "vue"'), features.includes('jsx'))
      assert.deepEqual(Object.keys(pkg.devDependencies), Object.keys(pkg.devDependencies).sort())
      const order = ['dev', 'build', 'preview', 'test:unit', 'test:e2e', 'build-only', 'type-check', 'lint', 'lint:oxlint', 'lint:eslint', 'format']
      assert.deepEqual(Object.keys(pkg.scripts), order.filter(key => key in pkg.scripts))
      for (const file of ['src/App.vue', 'vite.config.ts', 'tsconfig.app.json', '.gitignore']) assert.ok(has(file), file)
      for (const file of ['.github', '.husky', 'deploy', 'docker', 'features', 'package.fragment.json']) assert.equal(has(file), false, file)
      assert.equal(has('eslint.config.ts'), quality)
      assert.equal(has('.editorconfig'), quality)
      assert.equal(Boolean(pkg.scripts.lint), quality)
      assert.equal(Boolean(pkg.devDependencies.oxfmt), quality)
      assert.equal(has('vitest.config.ts'), unit)
      assert.equal(has('src/components/__tests__/HelloWorld.spec.ts'), unit)
      assert.equal(Boolean(pkg.devDependencies.vitest), unit)
      assert.equal(Boolean(pkg.scripts['test:unit']), unit)
      assert.equal(read('tsconfig.json').includes('tsconfig.vitest.json'), unit)
      assert.equal(has('playwright.config.ts'), e2e)
      assert.equal(has('e2e/vue.spec.ts'), e2e)
      assert.equal(Boolean(pkg.devDependencies['@playwright/test']), e2e)
      assert.equal(Boolean(pkg.scripts['test:e2e']), e2e)
      assert.equal(Boolean(pkg.devDependencies['@vitest/eslint-plugin']), quality && unit)
      assert.equal(Boolean(pkg.devDependencies['eslint-plugin-playwright']), quality && e2e)
      if (quality) {
        assert.equal(read('eslint.config.ts').includes('pluginVitest'), unit)
        assert.equal(read('eslint.config.ts').includes('pluginPlaywright'), e2e)
        assert.equal(JSON.parse(read('.oxlintrc.json')).plugins.includes('vitest'), unit)
      }
      const settings = JSON.parse(read('.vscode/settings.json'))
      assert.equal(Boolean(settings['editor.defaultFormatter']), quality)
      const extensions = read('.vscode/extensions.json')
      assert.equal(extensions.includes('vitest.explorer'), unit)
      assert.equal(extensions.includes('ms-playwright.playwright'), e2e)
      assert.equal(extensions.includes('dbaeumer.vscode-eslint'), quality)
      assert.equal(read('README.md').includes('pnpm test:unit'), unit)
      assert.equal(read('README.md').includes('pnpm test:e2e'), e2e)
      assert.equal(read('README.md').includes('pnpm lint'), quality)
      assert.equal(run([target, '--yes']).status, 1)
    }
    finally { fs.rmSync(temp, { recursive: true, force: true }) }
  })
}
test('CLI defaults, flags and errors', () => {
  assert.equal(run(['--help']).status, 0)
  assert.equal(run(['--bad']).status, 1)
  assert.equal(run(['--features=unknown', '--yes']).status, 1)
  assert.equal(run([]).status, 1)
  assert.deepEqual(parseArgs(['my-vue-app', '--yes', '--install']).options, { location: 'my-vue-app', features: [], install: true })
  assert.deepEqual(parseArgs(['--features=e2e,e2e']).options.features, ['e2e'])
  assert.throws(() => parseArgs(['a', 'b']))
})
test('multi-select, edit, installation preference and cancellation', async () => {
  const answers = ['my-vue-app', choices, true, 'edit', 'my-vue-app', [], false, 'create']
  let count = 0
  const result = await collectOptions({}, async (question) => {
    if (question.title === '选择可选功能') {
      assert.equal(question.multiple, true)
      assert.deepEqual(question.choices.map(c => c.label), ['代码规范', '单元测试', '端到端测试', 'JSX 支持'])
      assert.deepEqual(question.initial, count === 1 ? [] : choices)
    }
    return answers[count++]
  })
  assert.deepEqual(result, { location: 'my-vue-app', features: [], install: false })
  const cancel = ['my-vue-app', [], false, 'cancel']
  assert.equal(await collectOptions({}, async () => cancel.shift()), null)
})
test('current directory generation preserves .git and rejects occupied destinations', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'vue-target-'))
  try {
    fs.mkdirSync(path.join(temp, '.git'))
    writePlan(createPlan({ location: '.' }, temp))
    assert.ok(fs.existsSync(path.join(temp, '.git')))
    assert.throws(() => createPlan({ location: '.' }, temp), /空目录/)
    assert.throws(() => createPlan({ location: 'invalid name' }, temp), /项目名/)
  }
  finally { fs.rmSync(temp, { recursive: true, force: true }) }
})
