import path from 'node:path'
import { inside, namePattern } from './files.js'

export const platforms = ['github-pages', 'vercel', 'cloudflare', 'oss', 'cos', 'registry', 'server']
export function validate(root, target) {
  if (!target || target.version !== 1 || !namePattern.test(target.name || '') || !namePattern.test(target.environment || ''))
    throw new Error('version 必须为 1；name/environment 使用小写字母、数字、连字符，以字母开头')
  if (!platforms.includes(target.platform))
    throw new Error(`平台必须是：${platforms.join(', ')}`)
  const allowed = new Set(['version', 'name', 'environment', 'platform', 'app', 'build', 'output', 'image', 'dockerfile', 'context', 'container', 'project', 'bucket', 'region', 'prefix', 'trigger', 'branch', 'paths', 'runArgs'])
  for (const key of Object.keys(target)) {
    if (!allowed.has(key))
      throw new Error(`未知配置字段 ${key}；不要在目标文件中保存凭据`)
  }
  if (target.runArgs && (!Array.isArray(target.runArgs) || target.runArgs.some(x => typeof x !== 'string')))
    throw new Error('runArgs 必须是字符串数组')
  const app = inside(root, target.app)
  if (typeof target.build !== 'string' || !target.build.trim())
    throw new Error('必须指定从仓库根目录执行的 build 命令')
  if (!['registry', 'server'].includes(target.platform)) {
    const output = inside(root, target.output)
    if (output === root)
      throw new Error('不能将仓库根目录作为产物上传')
    const relativeApp = path.relative(output, app)
    if (!relativeApp || (!relativeApp.startsWith(`..${path.sep}`) && relativeApp !== '..' && !path.isAbsolute(relativeApp)))
      throw new Error('output 必须是独立产物目录，不能包含应用源码目录')
  }
  if (['registry', 'server'].includes(target.platform) && !/^[a-z0-9][\w./:@-]+$/i.test(target.image || ''))
    throw new Error('必须配置有效 image')
  if (['registry', 'server'].includes(target.platform) && (!target.image.includes('/') || (!/[.:]/.test(target.image.split('/')[0]) && target.image.split('/')[0] !== 'localhost')))
    throw new Error('image 必须包含明确仓库主机，例如 docker.io/team/app:tag')
  if (target.platform === 'registry') {
    inside(root, target.dockerfile)
    inside(root, target.context)
  }
  if (target.platform === 'server' && !namePattern.test(target.container || ''))
    throw new Error('必须配置 container 名称')
  if (target.platform === 'cloudflare' && !namePattern.test(target.project || ''))
    throw new Error('必须配置 Cloudflare project')
  if (['oss', 'cos'].includes(target.platform) && (typeof target.bucket !== 'string' || !target.bucket || typeof target.region !== 'string' || !target.region))
    throw new Error('必须配置 bucket 和 region')
  if (target.prefix && (target.prefix.includes('..') || target.prefix.startsWith('/')))
    throw new Error('prefix 必须是不含 .. 的相对前缀')
  if (target.trigger && !['manual', 'push'].includes(target.trigger))
    throw new Error('trigger 必须是 manual 或 push')
  if (target.trigger === 'push' && !/^[\w./-]+$/.test(target.branch || ''))
    throw new Error('push 触发必须指定 branch')
  if (target.paths && (!Array.isArray(target.paths) || target.paths.some(p => typeof p !== 'string' || !p || p.includes('..') || /[\r\n]/.test(p))))
    throw new Error('paths 必须是相对路径 glob 数组')
  return target
}
export function required(names) {
  for (const name of names) {
    if (!process.env[name])
      throw new Error(`缺少环境变量 ${name}`)
  }
}
