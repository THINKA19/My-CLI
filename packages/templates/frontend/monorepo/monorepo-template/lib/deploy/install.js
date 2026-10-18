import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { digest, inside } from '../../templates/features/deploy/shared/scripts/deploy/files.js'

const templates = fileURLToPath(new URL('../../templates/features/deploy/', import.meta.url))
const lib = fileURLToPath(new URL('../', import.meta.url))
export function installation(root, platform) {
  const files = new Map()
  function collect(source, destination, filter = () => true) {
    for (const e of fs.readdirSync(source, { withFileTypes: true })) {
      const from = path.join(source, e.name)
      if (e.isSymbolicLink())
        throw new Error('模板不能包含符号链接')
      if (!filter(e.name))
        continue
      const to = path.posix.join(destination, e.name)
      if (e.isDirectory())
        collect(from, to, filter)
      else files.set(to, fs.readFileSync(from))
    }
  }
  for (const name of ['options.js', 'prompts.js']) files.set(`deploy/tools/${name}`, fs.readFileSync(path.join(lib, name)))
  collect(path.join(lib, 'deploy'), 'deploy/tools/deploy')
  // Catalog stays separate from executable scripts and supports later offline additions.
  collect(templates, 'deploy/templates/features/deploy')
  collect(path.join(templates, 'shared/scripts/deploy'), 'scripts/deploy', name => name !== 'upload-utils.js')
  files.set('deploy/manage.mjs', Buffer.from(`import { manage } from './tools/deploy/command.js'\nimport { Cancelled } from './tools/prompts.js'\n\nmanage(process.argv.slice(2)).catch((error) => {\n  console.error(error.message)\n  process.exitCode = error instanceof Cancelled ? 130 : 1\n})\n`))
  if (platform) {
    collect(path.join(templates, platform, 'scripts/deploy'), 'scripts/deploy')
    if (['oss', 'cos'].includes(platform))
      files.set('scripts/deploy/upload-utils.js', fs.readFileSync(path.join(templates, 'shared/scripts/deploy/upload-utils.js')))
  }
  for (const [relative, content] of files) {
    const file = inside(root, relative)
    if (fs.existsSync(file) && digest(fs.readFileSync(file)) !== digest(content))
      throw new Error(`${relative} 已修改，拒绝覆盖`)
  }
  return files
}
