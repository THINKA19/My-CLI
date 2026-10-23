/* eslint-disable test/no-import-node-test -- CLI tests use the Node.js test runner */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { createPlan, writePlan } from '../lib/generate.js'
import { parseArgs } from '../lib/options.js'
import { collectOptions } from '../lib/prompts.js'
import { uiLibraries } from '../lib/ui.js'

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
      assert.equal(pkg.version, JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version)
      assert.equal(Boolean(pkg.devDependencies['@vitejs/plugin-vue-jsx']), features.includes('jsx'))
      assert.equal(read('vite.config.ts').includes('vueJsx()'), features.includes('jsx'))
      assert.equal(read('tsconfig.app.json'), fs.readFileSync(new URL('../templates/base/tsconfig.app.json', import.meta.url), 'utf8'))
      assert.equal(read('README.md').includes('已选功能：'), false)
      assert.deepEqual(Object.keys(pkg.devDependencies), Object.keys(pkg.devDependencies).sort())
      const order = ['dev', 'build', 'preview', 'test:unit', 'test:e2e', 'build-only', 'type-check', 'lint', 'lint:oxlint', 'lint:eslint', 'format']
      assert.deepEqual(Object.keys(pkg.scripts), order.filter(key => key in pkg.scripts))
      for (const file of ['src/app/App.vue', 'vite.config.ts', 'tsconfig.app.json', '.gitignore']) assert.ok(has(file), file)
      for (const file of ['.github', '.husky', 'deploy', 'docker', 'features', 'package.fragment.json']) assert.equal(has(file), false, file)
      assert.equal(has('eslint.config.ts'), quality)
      assert.equal(has('.editorconfig'), quality)
      assert.equal(Boolean(pkg.scripts.lint), quality)
      assert.equal(Boolean(pkg.devDependencies.oxfmt), quality)
      assert.equal(has('vitest.config.ts'), unit)
      assert.equal(has('src/components/__tests__/HomeView.spec.ts'), unit)
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
        assert.equal(read('.oxlintrc.json'), fs.readFileSync(new URL('../templates/features/code-quality/.oxlintrc.json', import.meta.url), 'utf8'))
        assert.equal(read('.oxfmtrc.json'), fs.readFileSync(new URL('../templates/features/code-quality/.oxfmtrc.json', import.meta.url), 'utf8'))
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
  assert.deepEqual(parseArgs(['my-vue-app', '--yes', '--install']).options, { type: 'admin', http: 'axios', ui: 'ant-design-vue', location: 'my-vue-app', features: [], install: true })
  assert.deepEqual(parseArgs(['--features=e2e,e2e']).options.features, ['e2e'])
  assert.throws(() => parseArgs(['a', 'b']))
})
test('project type first, filtered UI, edit and cancellation', async () => {
  const answers = ['mobile', 'vant', 'alova', choices, 'my-vue-app', true, 'edit', 'admin', 'ant-design-vue', 'alova', [], 'my-vue-app', false, 'create']
  const questions = []
  const result = await collectOptions({}, async (question) => {
    questions.push(question)
    return answers.shift()
  })
  assert.deepEqual(questions.slice(0, 7).map(q => q.title), ['选择项目类型（单选）', '选择 UI 组件库（单选）', '选择 HTTP 请求库（单选）', '选择可选功能', '项目创建位置', '是否立即安装依赖？', '确认配置'])
  assert.deepEqual(questions[1].choices.map(c => c.value), ['vant', '@nutui/nutui', 'tdesign-mobile-vue'])
  assert.equal(questions[1].initial, 'vant')
  assert.deepEqual(questions[8].choices.map(c => c.value), ['ant-design-vue', 'element-plus', 'naive-ui', 'tdesign-vue-next'])
  assert.equal(questions[8].initial, 'ant-design-vue')
  assert.equal(questions[9].initial, 'alova')
  assert.deepEqual(questions[10].initial, choices)
  for (const i of [0, 1, 2, 7, 8, 9]) assert.notEqual(questions[i].multiple, true)
  assert.deepEqual(result, { type: 'admin', http: 'alova', ui: 'ant-design-vue', location: 'my-vue-app', features: [], install: false })
  const cancel = ['admin', 'ant-design-vue', 'axios', [], '.', false, 'cancel']
  assert.equal(await collectOptions({}, async () => cancel.shift()), null)
})

test('editing the same type preserves the chosen UI', async () => {
  const answers = ['admin', 'naive-ui', 'axios', [], '.', false, 'edit', 'admin', 'naive-ui', 'axios', [], '.', false, 'create']
  let uiQuestions = 0
  await collectOptions({}, async (question) => {
    if (question.title === '选择 UI 组件库（单选）')
      assert.equal(question.initial, uiQuestions++ === 0 ? 'ant-design-vue' : 'naive-ui')
    return answers.shift()
  })
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

test('default project name', () => {
  assert.equal(parseArgs(['--yes']).options.location, '.')
  const plan = createPlan({}, path.join(os.tmpdir(), `vue-default-${process.pid}-${Date.now()}`))
  assert.equal(JSON.parse(plan.files.get('package.json')).name, 'vue-project')
})

const libraries = ['vant', '@nutui/nutui', 'tdesign-mobile-vue', 'ant-design-vue', 'element-plus', 'naive-ui', 'tdesign-vue-next']
const typeForUi = ui => ['vant', '@nutui/nutui', 'tdesign-mobile-vue'].includes(ui) ? 'mobile' : 'admin'
for (const ui of libraries) {
  for (let mask = 0; mask < 16; mask++) {
    test(`UI generation: ${ui} features: ${mask}`, () => {
      const plan = createPlan({ type: typeForUi(ui), ui, features: choices.filter((_, i) => mask & (1 << i)) }, path.join(os.tmpdir(), `ui-plan-${process.pid}-${Date.now()}`))
      const pkg = JSON.parse(plan.files.get('package.json'))
      assert.deepEqual(libraries.filter(name => pkg.dependencies[name]), [ui])
      const home = plan.files.get('src/app/pages/HomeView.vue').toString()
      assert.ok(home.includes('from \'@/ui/UiDemo.vue\''))
      assert.ok(plan.files.get('src/app/main.ts').toString().includes('import \'@/ui/setup\''))
      const demo = plan.files.get('src/ui/UiDemo.vue').toString()
      assert.ok(demo.includes(`from '${ui}'`))
      assert.ok(demo.includes('@click="count++"'))
      const template = new URL(`../templates/ui/${uiLibraries[ui].template}/`, import.meta.url)
      const fragment = JSON.parse(fs.readFileSync(new URL('package.fragment.json', template), 'utf8'))
      assert.equal(pkg.dependencies[ui], fragment.dependencies[ui])
      for (const file of ['src/ui/setup.ts', 'src/ui/UiDemo.vue'])
        assert.equal(plan.files.get(file).toString(), fs.readFileSync(new URL(file, template), 'utf8'))
      for (const [file, content] of plan.files) {
        assert.ok(!file.endsWith('.fragment.json'), file)
        if (/\.(?:vue|ts)$/.test(file))
          assert.ok(!content.toString().includes('__UI_'), file)
      }
      for (const name of libraries)
        assert.ok(!home.includes(`from '${name}'`))
      assert.equal(plan.files.has('src/ui/components/HelloWorld.vue'), false)
      assert.equal(plan.files.has('src/ui/assets/logo.svg'), false)
      assert.equal(plan.files.has('src/app/pages/AboutView.vue'), false)
      assert.ok(!plan.files.get('src/app/App.vue').toString().includes('HelloWorld'))
    })
  }
}
test('UI must be exactly one supported library', () => {
  for (const value of ['', 'unknown', 'vant,element-plus'])
    assert.throws(() => parseArgs([`--ui=${value}`]), /单选/)
  assert.throws(() => parseArgs(['--ui=vant', '--ui=naive-ui']), /只能指定一次/)
  assert.throws(() => createPlan({ ui: ['vant', 'naive-ui'] }), /单选/)
  for (const ui of libraries)
    assert.equal(parseArgs([`--type=${typeForUi(ui)}`, `--ui=${ui}`]).options.ui, ui)
})

test('HTTP must be exactly one supported library', () => {
  for (const value of ['', 'unknown', 'axios,alova'])
    assert.throws(() => parseArgs([`--http=${value}`]), /单选/)
  assert.throws(() => parseArgs(['--http=axios', '--http=alova']), /只能指定一次/)
  assert.throws(() => createPlan({ http: ['axios', 'alova'] }), /单选/)
})
for (const http of ['axios', 'alova']) {
  for (const ui of libraries) {
    for (let mask = 0; mask < 16; mask++) {
      test(`HTTP generation: ${http}, ${ui}, features: ${mask}`, () => {
        const plan = createPlan({ type: typeForUi(ui), http, ui, features: choices.filter((_, i) => mask & (1 << i)) }, path.join(os.tmpdir(), `http-plan-${process.pid}-${Date.now()}`))
        const pkg = JSON.parse(plan.files.get('package.json'))
        assert.deepEqual(['axios', 'alova'].filter(name => pkg.dependencies[name]), [http])
        for (const file of ['client.ts', 'example.ts'])
          assert.equal(plan.files.get(`src/http/${file}`).toString(), fs.readFileSync(new URL(`../templates/http/${http}/src/http/${file}`, import.meta.url), 'utf8'))
        assert.ok(plan.files.has('src/app/components/HttpDemo.vue'))
        assert.equal(JSON.parse(plan.files.get('public/mock/hello.json')).message, '本地 Mock 请求成功')
        assert.ok(![...plan.files.keys()].some(file => file.endsWith('.fragment.json')))
      })
    }
  }
}

test('type defaults, invalid types, mismatched UI and argument order', () => {
  assert.equal(parseArgs([]).options.type, 'admin')
  assert.equal(parseArgs([]).options.ui, 'ant-design-vue')
  assert.equal(parseArgs(['--type=mobile']).options.ui, 'vant')
  assert.equal(parseArgs(['--ui=@nutui/nutui', '--type=mobile']).options.ui, '@nutui/nutui')
  for (const value of ['', 'unknown', 'mobile,admin'])
    assert.throws(() => parseArgs([`--type=${value}`]), /单选/)
  assert.throws(() => parseArgs(['--type=mobile', '--type=admin']), /只能指定一次/)
  assert.throws(() => parseArgs(['--type=mobile', '--ui=element-plus']), /不支持/)
  assert.throws(() => parseArgs(['--type=admin', '--ui=vant']), /不支持/)
  assert.throws(() => createPlan({ type: ['mobile', 'admin'] }), /单选/)
})
