/* eslint-disable test/no-import-node-test */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { createPlan, writePlan } from '../lib/generate.js'
import { targets } from '../lib/options.js'

// Optional local integration run against an installed full dependency set.
// Example: VITEPRESS_TEST_NODE_MODULES=/absolute/path/node_modules pnpm test
const installed = process.env.VITEPRESS_TEST_NODE_MODULES
const root = fileURLToPath(new URL('../', import.meta.url))
const cases = [
  ...['zh', 'en', 'vi'].map(code => ({ name: `single-${code}`, languages: [code] })),
  { name: 'reading', enhancements: ['image-zoom', 'reading-progress'] },
  { name: 'mermaid', enhancements: ['mermaid'] },
  { name: 'subset', i18n: true, languages: ['en', 'vi'], defaultLanguage: 'vi' },
  { name: 'full', i18n: true, languages: ['zh', 'en', 'vi'], features: ['eslint', 'git-hooks', 'ci'], enhancements: ['mermaid', 'image-zoom', 'reading-progress'], targets: Object.keys(targets), automation: Object.keys(targets), registries: ['aliyun', 'tencent', 'dockerhub'] },
]

for (const options of cases) {
  test(`生成项目的真实菜单、类型与构建：${options.name}`, { skip: !installed, timeout: 240000 }, () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'vitepress-integration-'))
    try {
      const plan = createPlan({ ...options, location: '.' }, directory)
      writePlan(plan)
      fs.symlinkSync(path.resolve(installed), path.join(directory, 'node_modules'), 'junction')
      const env = { ...process.env, VITE_SITE_URL: 'https://example.com/docs/', VITE_BASE: '/docs/' }
      delete env.NODE_TEST_CONTEXT
      const run = (entry, args) => {
        try {
          return execFileSync(process.execPath, [path.join(directory, 'node_modules', entry), ...args], { cwd: directory, encoding: 'utf8', stdio: 'pipe', windowsHide: true, timeout: 180000, maxBuffer: 4 * 1024 * 1024, env })
        }
        catch (error) { throw new Error(`${entry} ${args.join(' ')}\n${error.stdout || ''}\n${error.stderr || ''}\n${error.message}`, { cause: error }) }
      }
      run('tsx/dist/cli.mjs', ['scripts/menus/index.ts', 'generate'])
      run('tsx/dist/cli.mjs', ['--test', 'tests/menus/generate.test.ts'])
      run('vue-tsc/bin/vue-tsc.js', ['--noEmit'])
      run('vitepress/bin/vitepress.js', ['build'])
      assert.ok(fs.existsSync(path.join(directory, 'dist/index.html')))
      if (!options.i18n) {
        const home = fs.readFileSync(path.join(directory, 'dist/index.html'), 'utf8')
        assert.ok(!home.includes('http-equiv="refresh"'))
        assert.ok(!home.includes('VPNavBarTranslations'))
      }
      if (options.name === 'full') {
        // Lint the actual generated project before adding maintainer-only fixtures.
        run('eslint/bin/eslint.js', ['.'])
        fs.cpSync(path.join(root, 'tests/legacy/tests/deploy'), path.join(directory, 'tests/deploy'), { recursive: true })
        fs.cpSync(path.join(root, 'tests/legacy/tests/i18n'), path.join(directory, 'tests/i18n'), { recursive: true })
        fs.copyFileSync(path.join(root, 'tests/legacy/.github/workflows/test-deploy.yml'), path.join(directory, '.github/workflows/test-deploy.yml'))
        run('tsx/dist/cli.mjs', ['--test', '--test-isolation=none', ...fs.readdirSync(path.join(directory, 'tests/deploy')).filter(file => file.endsWith('.test.mjs')).map(file => `tests/deploy/${file}`)])
        run('tsx/dist/cli.mjs', ['--test', '--test-isolation=none', 'tests/i18n/config.test.mjs'])
        run('typescript/bin/tsc', ['--noEmit', '-p', 'tests/i18n/tsconfig.json'])
      }
    }
    finally {
      assert.equal(path.dirname(path.resolve(directory)), path.resolve(os.tmpdir()))
      assert.ok(path.basename(directory).startsWith('vitepress-integration-'))
      // Unlink the junction before deleting the temporary checkout.
      const link = path.join(directory, 'node_modules')
      if (fs.existsSync(link))
        fs.unlinkSync(link)
      fs.rmSync(directory, { recursive: true, force: true })
    }
  })
}
