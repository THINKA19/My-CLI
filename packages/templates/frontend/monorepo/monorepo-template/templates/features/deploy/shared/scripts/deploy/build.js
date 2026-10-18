import { execSync } from 'node:child_process'
import fs from 'node:fs'
import { inside } from './files.js'

export function build(root, target) {
  if (!fs.existsSync(inside(root, target.app)))
    throw new Error('应用尚未创建')
  if (target.build)
    execSync(target.build, { cwd: root, stdio: 'inherit' })
}
