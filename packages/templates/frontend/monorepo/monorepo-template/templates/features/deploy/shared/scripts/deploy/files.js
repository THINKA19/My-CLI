import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

export const json = value => `${JSON.stringify(value, null, 2)}\n`
export const read = file => JSON.parse(fs.readFileSync(file, 'utf8'))
export const digest = text => crypto.createHash('sha256').update(String(text).replaceAll('\r\n', '\n')).digest('hex')
export const namePattern = /^[a-z][a-z0-9-]{0,62}$/
export function inside(root, relative) {
  if (typeof relative !== 'string' || !relative || path.isAbsolute(relative) || relative.includes('\\') || /[\r\n]/.test(relative))
    throw new Error('路径必须是仓库内的相对路径')
  const result = path.resolve(root, relative)
  if (result !== root && !result.startsWith(`${root}${path.sep}`))
    throw new Error('路径超出仓库')
  let current = result
  while (current.startsWith(root)) {
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink())
      throw new Error(`不支持符号链接：${current}`)
    if (current === root)
      break
    current = path.dirname(current)
  }
  return result
}
export function write(root, relative, value) {
  const file = inside(root, relative)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, value)
}
