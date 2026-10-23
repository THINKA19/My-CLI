import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'
const require = createRequire(import.meta.url)
const bin = path.join(path.dirname(require.resolve('vite/package.json')), 'bin/vite.js')
const result = spawnSync(process.execPath, [bin, 'build'], { stdio: 'inherit', windowsHide: true, env: { ...process.env, ANALYZE: 'true' } })
if (result.error) throw result.error
process.exitCode = result.status ?? 1
