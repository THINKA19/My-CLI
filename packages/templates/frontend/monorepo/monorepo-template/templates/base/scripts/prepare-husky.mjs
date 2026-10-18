import { spawnSync } from 'node:child_process'
import fs from 'node:fs'

// Only install hooks for this generated repository, never a parent workspace.
if (process.env.HUSKY !== '0' && process.env.CI !== 'true' && process.env.NODE_ENV !== 'production' && fs.existsSync('.git')) {
  const { default: husky } = await import('husky')
  const result = husky()
  if (result) {
    console.error(result)
    process.exitCode = 1
  }
  else {
    const result = spawnSync('git', ['config', '--get', 'core.hooksPath'], { encoding: 'utf8' })
    if (result.status !== 0)
      process.exitCode = 1
  }
}
