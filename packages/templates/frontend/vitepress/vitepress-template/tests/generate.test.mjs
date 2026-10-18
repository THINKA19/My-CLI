/* eslint-disable test/no-import-node-test */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { assertTarget, createPlan, selectLockfile, writePlan } from '../lib/generate.js'
import { normalizeOptions, targets } from '../lib/options.js'
import { Cancelled, collectOptions } from '../lib/prompts.js'

const root = fileURLToPath(new URL('../', import.meta.url))
const text = (plan, relative) => plan.files.get(relative)?.toString('utf8')
const pkg = plan => JSON.parse(text(plan, 'package.json'))
const full = {
  i18n: true,
  languages: ['zh', 'en', 'vi'],
  defaultLanguage: 'zh',
  features: ['eslint', 'git-hooks', 'ci'],
  enhancements: ['mermaid', 'image-zoom', 'reading-progress'],
  targets: Object.keys(targets),
  automation: Object.keys(targets),
  registries: ['aliyun', 'tencent', 'dockerhub'],
}

function temporary(run) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'vitepress-generator-'))
  try {
    return run(directory)
  }
  finally {
    assert.equal(path.dirname(path.resolve(directory)), path.resolve(os.tmpdir()))
    assert.ok(path.basename(directory).startsWith('vitepress-generator-'))
    fs.rmSync(directory, { recursive: true, force: true })
  }
}

test('基础版只有单语言站点，不包含可选功能或本机产物', () => {
  const plan = createPlan({ location: 'MyFocus' })
  const manifest = pkg(plan)
  assert.equal(manifest.name, 'myfocus')
  for (const dependency of ['mermaid', 'eslint', 'husky', 'lint-staged', 'ali-oss', 'cos-nodejs-sdk-v5']) assert.equal(manifest.devDependencies[dependency], undefined)
  for (const relative of plan.files.keys()) {
    assert.ok(!/^(?:docker|scripts\/deploy|\.github|\.husky|node_modules|dist|\.agents)\//.test(relative), relative)
    assert.ok(!relative.endsWith('.tpl'), relative)
    assert.ok(!text(plan, relative).includes('__LOCALE_IMPORTS__'), relative)
  }
  assert.ok(plan.files.has('src/index.md'))
  assert.ok(!plan.files.has('src/zh/index.md'))
  assert.ok(!plan.files.has('.vitepress/theme/components/RootRedirect.vue'))
  assert.ok(!plan.files.has('.vitepress/config/sitemap.ts'))
  assert.ok(!plan.files.has('skills-lock.json'))
  assert.ok(!plan.files.has('.npmignore'))
  assert.ok(!text(plan, '.vitepress/config.ts').includes('locales:'))
  assert.ok(!text(plan, '.vitepress/theme/index.ts').includes('mermaid'))
  assert.ok(!plan.files.has('.vitepress/theme/enhancements/mermaid.ts'))
  assert.ok(!text(plan, '.vitepress/theme/index.ts').includes('__ENHANCEMENT_'))
})

test('三种单语言只生成自身页面、文案和根路径链接', () => {
  for (const code of ['zh', 'en', 'vi']) {
    const plan = createPlan({ languages: [code] })
    assert.match(text(plan, '.vitepress/config/menu/registry.ts'), /"prefix": "\/"/)
    assert.match(text(plan, '.vitepress/config/menu/registry.ts'), new RegExp(`"${code}":`))
    assert.ok(!text(plan, 'src/index.md').includes(`/${code}/`))
    assert.match(text(plan, '.vitepress/config/search.ts'), new RegExp(`translations: translations.${code}`))
    for (const other of ['zh', 'en', 'vi'].filter(value => value !== code))
      assert.ok(![...plan.files.keys()].some(relative => relative.startsWith(`.vitepress/config/locales/${other}/`)))
  }
})

test('多语言支持任意已有语言子集及默认语言，无硬编码中文回退', () => {
  const plan = createPlan({ i18n: true, languages: ['en', 'vi'], defaultLanguage: 'vi' })
  assert.ok(plan.files.has('src/en/index.md'))
  assert.ok(plan.files.has('src/vi/index.md'))
  assert.ok(!plan.files.has('src/zh/index.md'))
  const registry = text(plan, '.vitepress/config/menu/registry.ts')
  assert.equal((registry.match(/"fallback": "vi"/g) || []).length, 2)
  assert.match(registry, /"vi":\s*\{\s*"configKey": "root"/)
  assert.match(text(plan, '.vitepress/config/language.ts'), /locales: localesConfig/)
  assert.ok(plan.files.has('.vitepress/theme/components/RootRedirect.vue'))
  assert.throws(() => normalizeOptions({ i18n: true, languages: ['en'] }), /至少/)
  assert.throws(() => normalizeOptions({ languages: ['zh', 'en'] }), /只能/)
  assert.throws(() => normalizeOptions({ languages: ['en'], defaultLanguage: 'zh' }), /默认语言/)
})

test('Mermaid 完整接入可选依赖、主题、Markdown 与样式', () => {
  const plan = createPlan({ enhancements: ['mermaid'] })
  assert.ok(pkg(plan).devDependencies.mermaid)
  assert.match(text(plan, '.vitepress/config.ts'), /lang === 'mermaid'/)
  assert.match(text(plan, '.vitepress/theme/index.ts'), /import \{ setupMermaid \} from '.\/enhancements\/mermaid'/)
  assert.match(text(plan, '.vitepress/theme/index.ts'), /setupMermaid\(\)/)
  assert.match(text(plan, '.vitepress/theme/index.ts'), /extends: DefaultTheme/)
  assert.match(text(plan, '.vitepress/theme/enhancements/mermaid.ts'), /mermaid.render/)
  assert.ok(plan.files.has('.vitepress/theme/styles/mermaid.css'))
})

test('CI 与 Git hooks 仅调用实际选中的检查', () => {
  const hooks = createPlan({ features: ['git-hooks'] })
  assert.ok(hooks.files.has('.husky/commit-msg'))
  assert.ok(!hooks.files.has('.husky/pre-commit'))
  assert.equal(pkg(hooks).devDependencies['lint-staged'], undefined)
  const both = createPlan({ features: ['git-hooks', 'eslint'] })
  assert.ok(both.files.has('.husky/pre-commit'))
  assert.ok(pkg(both)['lint-staged'])
  const ci = createPlan({ features: ['ci'] })
  assert.ok(!text(ci, '.github/workflows/ci.yml').includes('pnpm run lint'))
  assert.ok(!text(ci, '.github/workflows/ci.yml').includes('test:deploy'))
  assert.match(text(ci, '.github/workflows/ci.yml'), /pnpm run build/)
  assert.match(text(createPlan({ features: ['ci', 'eslint'] }), '.github/workflows/ci.yml'), /pnpm run lint/)
})

test('部署单选、多选与全选均无缺失的本地工作流或脚本引用', () => {
  const cases = [full, ...Object.keys(targets).map(target => ({ targets: [target], automation: [target], ...(target === 'server' ? { registries: ['dockerhub'] } : {}) })), { docker: true, registries: ['dockerhub'] }, { docker: true }]
  for (const options of cases) {
    const plan = createPlan(options)
    for (const [relative] of plan.files) {
      if (!relative.startsWith('.github/workflows/'))
        continue
      const content = text(plan, relative)
      for (const match of content.matchAll(/uses: \.\/(\.github\/workflows\/\S+)/g)) assert.ok(plan.files.has(match[1]), `${relative} -> ${match[1]}`)
      for (const match of content.matchAll(/(?:node |\s)(scripts\/deploy\/[\w.-]+\.js)/g)) assert.ok(plan.files.has(match[1]), `${relative} -> ${match[1]}`)
    }
    assert.ok(plan.files.has('scripts/deploy/build.js'))
  }
  const local = createPlan({ targets: ['oss', 'vercel'] })
  assert.ok(![...local.files.keys()].some(relative => relative.startsWith('.github/')))
  assert.ok(local.files.has('scripts/deploy/oss.js'))
  assert.ok(!local.files.has('scripts/deploy/cos.js'))
  assert.ok(pkg(local).devDependencies['ali-oss'])
  assert.equal(pkg(local).devDependencies['cos-nodejs-sdk-v5'], undefined)
  assert.ok(!text(createPlan({ docker: true, registries: ['dockerhub'] }), '.github/workflows/docker-cloud.yml').includes('uses: ./.github/workflows/deploy.yml'))
})

test('锁文件只筛选 importer，不改已有版本和传递依赖快照', () => {
  const original = fs.readFileSync(path.join(root, 'templates/lock/pnpm-lock.yaml'), 'utf8').replace(/\r\n/g, '\n')
  const plan = createPlan()
  const lock = text(plan, 'pnpm-lock.yaml')
  const importer = lock.split('importers:').at(-1).split('\npackages:')[0]
  assert.ok(!importer.includes('mermaid:'))
  assert.ok(!importer.includes('ali-oss:'))
  assert.ok(importer.includes('vitepress:'))
  assert.equal(lock.split('\npackages:').at(-1), original.split('\npackages:').at(-1))
  assert.equal(selectLockfile(original, pkg(createPlan(full))), original)
})

test('当前目录保留 .git，非空目录和无效选项在写入前拒绝', () => temporary((directory) => {
  fs.mkdirSync(path.join(directory, '.git'))
  const plan = createPlan({ location: '.' }, directory)
  writePlan(plan)
  assert.ok(fs.existsSync(path.join(directory, '.git')))
  assert.ok(fs.existsSync(path.join(directory, 'src/index.md')))
  assert.throws(() => assertTarget(plan), /不为空/)
  assert.throws(() => createPlan({ enhancements: ['gsap'] }), /未知/)
  assert.throws(() => createPlan({ targets: ['server'], automation: ['server'] }), /镜像仓库/)
  assert.throws(() => createPlan({ automation: ['oss'] }), /已选部署/)
}))

test('workspace 子项目复用根依赖管理，根配置保持不变', () => temporary((directory) => {
  const workspace = 'packages:\n  - apps/*\n'
  fs.writeFileSync(path.join(directory, 'pnpm-workspace.yaml'), workspace)
  fs.writeFileSync(path.join(directory, 'package.json'), '{"private":true}')
  const plan = createPlan({ location: 'apps/docs', features: ['eslint'] }, directory)
  assert.equal(plan.workspace.root, directory)
  assert.ok(!plan.files.has('pnpm-lock.yaml'))
  assert.ok(!plan.files.has('pnpm-workspace.yaml'))
  assert.ok(!plan.files.has('.npmrc'))
  assert.equal(pkg(plan).scripts.preinstall, undefined)
  assert.equal(pkg(plan).devEngines, undefined)
  writePlan(plan)
  assert.equal(fs.readFileSync(path.join(directory, 'pnpm-workspace.yaml'), 'utf8'), workspace)
  assert.throws(() => createPlan({ location: 'apps/other', features: ['ci'] }, directory), /根目录管理/)
}))

test('交互单语言使用单选，多语言使用多选并只列出已选默认语言', async () => {
  const seen = []
  const ask = async (question) => {
    seen.push(question)
    const answers = { '项目创建位置': '.', '是否启用国际化多语言？': true, '需要支持哪些语言？': ['en', 'vi'], '默认语言': 'vi', '需要哪些代码质量与检查功能？': [], '需要哪些内容与交互增强？': [], '选择部署目标与容器支持': [], '是否立即安装依赖？': false }
    return answers[question.title]
  }
  const result = await collectOptions({}, ask)
  assert.deepEqual(result.languages, ['en', 'vi'])
  const language = seen.find(question => question.title === '需要支持哪些语言？')
  assert.equal(language.multiple, true)
  assert.ok(language.validate(['en']))
  assert.equal(language.validate(['en', 'vi']), undefined)
  assert.deepEqual(seen.find(question => question.title === '默认语言').choices.map(choice => choice.value), ['en', 'vi'])
  const single = []
  await collectOptions({}, async (question) => {
    single.push(question)
    return question.title === '项目创建位置' ? '.' : question.title === '站点语言' ? 'en' : question.multiple ? [] : false
  })
  assert.equal(single.find(question => question.title === '站点语言').multiple, undefined)
  assert.ok(!single.some(question => question.title === '默认语言'))
  await assert.rejects(collectOptions({}, async () => {
    throw new Cancelled()
  }), Cancelled)
})

test('CLI 非交互需显式 --yes，帮助和错误调用不生成文件', () => temporary((directory) => {
  const cli = path.join(root, 'bin/index.js')
  const help = spawnSync(process.execPath, [cli, '--help'], { cwd: directory, encoding: 'utf8' })
  assert.equal(help.status, 0)
  const interactive = spawnSync(process.execPath, [cli], { cwd: directory, encoding: 'utf8' })
  assert.equal(interactive.status, 1)
  assert.match(interactive.stderr, /--yes/)
  const invalid = spawnSync(process.execPath, [cli, '--yes', '--unknown'], { cwd: directory, encoding: 'utf8' })
  assert.equal(invalid.status, 1)
  assert.deepEqual(fs.readdirSync(directory), [])
  const created = spawnSync(process.execPath, [cli, '--yes', '--languages=en'], { cwd: directory, encoding: 'utf8' })
  assert.equal(created.status, 0, created.stderr)
  assert.ok(fs.existsSync(path.join(directory, 'src/index.md')))
}))

test('阅读增强按需接入，且与 Mermaid 共存', () => {
  for (const enhancements of [['image-zoom'], ['reading-progress'], ['mermaid', 'image-zoom', 'reading-progress']]) {
    const plan = createPlan({ enhancements })
    const theme = text(plan, '.vitepress/theme/index.ts')
    for (const name of ['image-zoom', 'reading-progress'])
      assert.equal(plan.files.has(`.vitepress/theme/enhancements/${name}.ts`), enhancements.includes(name))
    assert.equal(Boolean(pkg(plan).devDependencies['medium-zoom']), enhancements.includes('image-zoom'))
    assert.equal(theme.includes('setupImageZoom()'), enhancements.includes('image-zoom'))
    assert.equal(theme.includes('setupReadingProgress()'), enhancements.includes('reading-progress'))
    assert.ok(!theme.includes('__ENHANCEMENT_'))
  }
})
