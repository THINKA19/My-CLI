import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

export function command(binary, args, options = {}) {
  const r = spawnSync(binary, args, { stdio: 'inherit', ...options })
  if (r.error || r.status !== 0)
    throw new Error(`${binary} 执行失败 (${r.status})`, { cause: r.error })
}

export function pnpm(args, cwd) {
  if (process.platform !== 'win32')
    return command('pnpm', args, { cwd })
  const candidates = [process.env.npm_execpath]
  const located = spawnSync('where.exe', ['pnpm.cmd'], { encoding: 'utf8' })
  for (const shim of (located.stdout || '').trim().split(/\r?\n/)) {
    for (const ext of ['mjs', 'cjs']) candidates.push(path.join(path.dirname(shim), `node_modules/pnpm/bin/pnpm.${ext}`))
  }
  const cli = candidates.find(x => x && /pnpm/i.test(x) && fs.existsSync(x))
  if (!cli)
    throw new Error('无法定位 pnpm Node 入口；请通过 pnpm run deploy run 执行')
  command(process.execPath, [cli, ...args], { cwd })
}
