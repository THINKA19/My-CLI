import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const templates = fileURLToPath(new URL('../../templates/features/deploy/', import.meta.url))
const scalar = value => /^[\w./-]+$/.test(value) ? value : `'${String(value).replaceAll('\'', '\'\'')}'`
export function workflow(target) {
  const dir = path.join(templates, target.platform, '.github/workflows')
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.yml.tpl'))
  if (files.length !== 1)
    throw new Error('每个平台必须提供一个部署工作流入口模板')
  const text = fs.readFileSync(path.join(dir, files[0]), 'utf8')
  const push = target.trigger === 'push' ? `  push:\n    branches:\n      - ${scalar(target.branch)}\n${target.paths?.length ? `    paths:\n${target.paths.map(p => `      - ${scalar(p)}\n`).join('')}` : ''}` : ''
  const values = { __TARGET_NAME__: target.name, __ENVIRONMENT__: target.environment, __OUTPUT__: scalar(target.output || ''), __PUSH__: push }
  return text.replace(/__TARGET_NAME__|__ENVIRONMENT__|__OUTPUT__|__PUSH__/g, key => values[key])
}
