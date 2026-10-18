import fs from 'node:fs'
import path from 'node:path'
import { inside, json } from './files.js'

export function prepareVercel(root, t, output) {
  const stage = inside(root, `.deploy-output/${t.name}`)
  const relative = path.relative(output, stage)
  const inverse = path.relative(stage, output)
  const contains = value => !value || (!value.startsWith(`..${path.sep}`) && value !== '..' && !path.isAbsolute(value))
  if (contains(relative) || contains(inverse))
    throw new Error('Vercel 暂存目录不能与产物目录重叠')
  fs.mkdirSync(stage, { recursive: true })
  const buildOutput = inside(root, `.deploy-output/${t.name}/.vercel/output`)
  fs.rmSync(buildOutput, { recursive: true, force: true })
  fs.mkdirSync(buildOutput, { recursive: true })
  fs.cpSync(output, path.join(buildOutput, 'static'), { recursive: true, dereference: false })
  fs.writeFileSync(path.join(buildOutput, 'config.json'), json({ version: 3 }))

  return stage
}
