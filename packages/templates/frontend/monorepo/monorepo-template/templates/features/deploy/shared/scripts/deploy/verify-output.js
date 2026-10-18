import fs from 'node:fs'
import path from 'node:path'
import { inside } from './files.js'

export function verifyOutput(root, target) {
  const output = inside(root, target.output)
  if (!fs.existsSync(output) || !fs.statSync(output).isDirectory() || !fs.readdirSync(output).length)
    throw new Error('产物目录不存在或为空')
  const files = []
  function walk(dir, prefix = '') {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isSymbolicLink())
        throw new Error('产物不能包含符号链接')
      const relative = path.posix.join(prefix, e.name)
      if (e.isDirectory())
        walk(path.join(dir, e.name), relative)
      else files.push(relative)
    }
  }
  walk(output)
  if (!files.length)
    throw new Error('产物目录不包含任何文件')

  return { output, files }
}
