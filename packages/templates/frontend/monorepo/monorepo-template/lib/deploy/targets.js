/* eslint-disable no-console */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { digest, inside, json, namePattern, read, write } from '../../templates/features/deploy/shared/scripts/deploy/files.js'
import { validate } from '../options.js'
import { installation } from './install.js'
import { workflow } from './workflows.js'

const templateRoot = fileURLToPath(new URL('../../templates/features/deploy/', import.meta.url))
function state(root) {
  const file = inside(root, 'deploy/.managed.json')
  return fs.existsSync(file) ? read(file) : {}
}
const documentation = `# 部署目标管理\n\n运行 pnpm run deploy add、list、edit 名称、remove 名称、run 名称 --dry-run。实际发布使用 run 名称；GitHub Pages 使用 Actions。非交互新增/编辑使用 --config JSON文件。\n\n配置 version:1，name、environment 使用小写字母数字连字符；app、output、dockerfile、context 相对仓库根；build 从根目录执行。可先配置尚未创建的应用，运行时校验。\n\n支持 github-pages/vercel/cloudflare 静态产物、oss/cos 对象存储、registry 镜像发布、server SSH 容器部署。Vercel 仅静态输出，SSR 不在此适配器范围。Pages 每仓库一个站点，多应用请先聚合。\n\n每个目标生成独立工作流，默认 manual；trigger:push 搭配 branch 和可选 paths 数组启用自动部署。凭据使用 GitHub Environment。凭据只放对应 Environment Secrets；参见生成工作流 env。服务器预装 Docker、预先配置私有仓库登录，SERVER_KNOWN_HOSTS 必须使用核验后的主机密钥。runArgs 数组配置端口、网络、挂载等，空数组不发布端口。服务器替换容器会短暂停机，不含自动回滚。\n\n新增 OSS/COS 依赖后运行 pnpm install 并提交根锁文件。删除目标不删除依赖、云端资源或远端旧文件。修改过的生成工作流拒绝覆盖/删除，请手动合并；自动触发的 paths 应覆盖共享包和根配置变更；未设置 paths 时监听分支全部变更。\n\n平台命令需要网络、实际账号及权限。dry-run 只校验目标配置，不构建、不上传。\n`
export function enable(root) {
  root = path.resolve(root)
  if (!fs.existsSync(inside(root, 'pnpm-workspace.yaml')))
    throw new Error('请在 pnpm workspace 根目录执行')
  const files = installation(root)
  const pkgFile = inside(root, 'package.json')
  const pkg = read(pkgFile)
  if (pkg.scripts?.deploy && pkg.scripts.deploy !== 'node deploy/manage.mjs')
    throw new Error('已有 deploy 命令，拒绝覆盖')
  pkg.scripts = { ...pkg.scripts, deploy: 'node deploy/manage.mjs' }
  for (const [relative, content] of files) write(root, relative, content)
  write(root, 'package.json', json(pkg))
  if (!fs.existsSync(inside(root, 'deploy/README.md')))
    write(root, 'deploy/README.md', documentation)
}
export function saveTarget(root, input, editing = false) {
  root = path.resolve(root)
  const t = validate(root, input)
  const targetFile = `deploy/targets/${t.name}.json`
  const wf = `.github/workflows/deploy-${t.name}.yml`
  const manifest = state(root)
  const exists = fs.existsSync(inside(root, targetFile))
  if (editing !== exists)
    throw new Error(editing ? '目标不存在' : '目标已存在')
  if (fs.existsSync(inside(root, wf)) && (!manifest[t.name] || digest(fs.readFileSync(inside(root, wf))) !== manifest[t.name]))
    throw new Error('工作流已有用户修改，拒绝覆盖；请手动合并')
  // GitHub Pages publishes one site per repository, so disallow competing targets.
  if (t.platform === 'github-pages' && listTargets(root).some(x => x.name !== t.name && x.platform === 'github-pages'))
    throw new Error('一个仓库只允许一个 GitHub Pages 目标；多个站点请先聚合或使用其他平台')
  const pkg = read(inside(root, 'package.json'))
  const deps = read(path.join(templateRoot, t.platform, 'package.fragment.json')).devDependencies || {}
  const platformFiles = installation(root, t.platform)
  const text = workflow(t)
  for (const [name, version] of Object.entries(deps)) {
    if (pkg.devDependencies?.[name] && pkg.devDependencies[name] !== version)
      throw new Error(`已有依赖 ${name} 版本不同，请先手动统一`)
  }
  enable(root)
  const updated = read(inside(root, 'package.json'))
  if (Object.keys(deps).length)
    updated.devDependencies = Object.fromEntries(Object.entries({ ...updated.devDependencies, ...deps }).sort(([a], [b]) => a.localeCompare(b, 'en')))
  write(root, 'package.json', json(updated))
  for (const [relative, content] of platformFiles) write(root, relative, content)
  write(root, targetFile, json(t))
  write(root, wf, text)
  manifest[t.name] = digest(text)
  write(root, 'deploy/.managed.json', json(manifest))
  console.log(`已保存 ${t.name}；安装依赖并提交更新后的锁文件。凭据使用 GitHub Environment ${t.environment} 的 Secrets。`)
}
export function listTargets(root) {
  const dir = inside(path.resolve(root), 'deploy/targets')
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => read(path.join(dir, f))) : []
}
export function removeTarget(root, name) {
  root = path.resolve(root)
  if (!namePattern.test(name || ''))
    throw new Error('无效目标名称')
  const manifest = state(root)
  const wf = `.github/workflows/deploy-${name}.yml`
  if (!fs.existsSync(inside(root, `deploy/targets/${name}.json`)))
    throw new Error('目标不存在')
  if (fs.existsSync(inside(root, wf)) && digest(fs.readFileSync(inside(root, wf))) !== manifest[name])
    throw new Error('工作流已有修改，拒绝删除')
  fs.rmSync(inside(root, wf), { force: true })
  fs.unlinkSync(inside(root, `deploy/targets/${name}.json`))
  delete manifest[name]
  write(root, 'deploy/.managed.json', json(manifest))
  console.log('已移除目标和未修改的生成工作流；共享脚本和依赖保留，不删除云端资源。')
}
