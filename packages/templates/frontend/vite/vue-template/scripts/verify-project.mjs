// Run against a generated project after installing its dependencies.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

const target = path.resolve(process.argv[2] || '.')
const pkg = JSON.parse(fs.readFileSync(path.join(target, 'package.json'), 'utf8'))
const require = createRequire(path.join(target, 'package.json'))
const bin = (name, relative) => path.join(path.dirname(require.resolve(`${name}/package.json`)), relative)
const checks = [
  ['type-check', bin('vue-tsc', 'bin/vue-tsc.js'), '--build'],
  ['build', bin('vite', 'bin/vite.js'), 'build'],
]
if (pkg.devDependencies?.vitest)
  checks.push(['unit', bin('vitest', 'vitest.mjs'), 'run'])
if (pkg.devDependencies?.eslint)
  checks.push(['eslint', bin('eslint', 'bin/eslint.js'), '.'])
if (pkg.devDependencies?.oxlint)
  checks.push(['oxlint', bin('oxlint', 'bin/oxlint'), 'src', 'config', 'vite.config.ts', '--no-ignore'])
if (pkg.scripts?.analyze)
  checks.push(['analyze', path.join(target, 'scripts/analyze.mjs')])
for (const [name, ...args] of checks) {
  console.log(`Verify: ${name}`)
  const result = spawnSync(process.execPath, args, { cwd: target, stdio: 'inherit', windowsHide: true })
  if (result.error)
    throw result.error
  if (result.status !== 0)
    process.exit(result.status ?? 1)
}
