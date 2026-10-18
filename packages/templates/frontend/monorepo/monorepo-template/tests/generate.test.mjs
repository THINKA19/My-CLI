import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
const cli = fileURLToPath(new URL('../bin/index.js', import.meta.url))
const run = args => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' })
for (const docker of [false, true]) {
  for (const cd of [false, true]) {
    test('generation docker=' + docker + ' cd=' + cd, () => {
      const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'monorepo-options-'))
      try {
        const target = path.join(temp, 'repo')
        const result = run([target, '--yes', ...(docker ? ['--docker'] : []), ...(cd ? ['--cd'] : [])])
        assert.equal(result.status, 0, result.stderr)
        const has = file => fs.existsSync(path.join(target, file))
        assert.equal(has('docker/compose.yml'), docker)
        assert.equal(has('.dockerignore'), docker)
        assert.equal(has('deploy/manage.mjs'), cd)
        assert.equal(has('.github/workflows/release.yml'), false)
        for (const file of ['eslint.config.js', '.husky/pre-commit', '.husky/commit-msg', '.github/workflows/ci.yml', 'apps/frontend/.gitkeep', 'apps/backend/.gitkeep']) assert.ok(has(file), file)
        assert.equal(has('features'), false)
        const pkg = JSON.parse(fs.readFileSync(path.join(target, 'package.json')))
        assert.equal(Boolean(pkg.scripts['docker:dev']), docker)
        assert.equal(pkg.packageManager, 'pnpm@' + pkg.devEngines.packageManager.version)
        assert.equal(run([target, '--yes']).status, 1)
      }
      finally { fs.rmSync(temp, { recursive: true, force: true }) }
    })
  }
}
test('help, invalid flags and non-interactive invocation', () => {
  assert.equal(run(['--help']).status, 0)
  assert.equal(run(['--bad']).status, 1)
  assert.equal(run([]).status, 1)
})
