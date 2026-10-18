import path from 'node:path'
import { inside, namePattern } from '../../templates/features/deploy/shared/scripts/deploy/files.js'

export const dockerFeatures = { dev: '应用开发环境', image: '应用生产镜像', compose: 'Compose 服务编排' }
export const dockerKinds = { static: '静态前端（构建后由 Nginx 托管）', node: 'Node.js 服务' }
export function defaultDockerApp(kind = 'static') {
  return kind === 'static'
    ? { name: 'web', kind, app: 'apps/frontend/web', package: 'web', devCommand: 'pnpm --filter web dev --host 0.0.0.0', buildCommand: 'pnpm --filter web... build', output: 'apps/frontend/web/dist', devPort: 5173, devHostPort: 5173, port: 80, hostPort: 8080 }
    : { name: 'api', kind, app: 'apps/backend/api', package: 'api', devCommand: 'pnpm --filter api dev', buildCommand: 'pnpm --filter api... build', startCommand: 'node apps/backend/api/dist/index.js', devPort: 3000, devHostPort: 3000, port: 3000, hostPort: 3000 }
}
export function normalizeDocker(value = false) {
  if (value != null && typeof value !== 'boolean' && !Array.isArray(value) && typeof value !== 'object')
    throw new Error('Docker 配置必须是用途数组或配置对象')
  const features = value === true ? Object.keys(dockerFeatures) : Array.isArray(value) ? value : value?.features || []
  if (!Array.isArray(features) || features.some(f => !Object.hasOwn(dockerFeatures, f)))
    throw new Error('Docker 配置只能选择 dev、image、compose')
  const selected = [...new Set(features)]
  const defaults = selected.some(f => f !== 'compose') ? [defaultDockerApp(), defaultDockerApp('node')] : []
  return { features: selected, apps: value?.apps ?? defaults, services: value?.services ?? [] }
}
export function validateDocker(root, input) {
  const config = normalizeDocker(input)
  if (!Array.isArray(config.apps) || !Array.isArray(config.services))
    throw new Error('Docker apps/services 必须是数组')
  if (!config.features.length && (config.apps.length || config.services.length))
    throw new Error('未选择 Docker 用途时不能指定应用或服务')
  const appModes = config.features.some(f => ['dev', 'image'].includes(f))
  if (appModes && !config.apps.length)
    throw new Error('开发环境或生产镜像至少需要一个应用配置')
  if (!appModes && config.apps.length)
    throw new Error('仅编排时请使用已有镜像或 Dockerfile 服务')
  if (!config.features.includes('compose') && config.services.length)
    throw new Error('额外服务需要选择 Compose 编排')
  if (config.features.includes('compose') && !config.apps.length && !config.services.length)
    throw new Error('Compose 至少需要一个服务')
  const names = new Set()
  const name = (value) => {
    if (!namePattern.test(value || '') || names.has(value))
      throw new Error('Docker 应用和服务名称必须唯一，使用小写字母、数字和连字符')
    names.add(value)
  }
  const command = (value, field) => {
    if (typeof value !== 'string' || !value.trim() || /[\r\n\0]/.test(value))
      throw new Error(`Docker ${field} 必须是非空的单行命令`)
  }
  const port = (value) => {
    if (!Number.isInteger(value) || value < 1 || value > 65535)
      throw new Error('Docker 端口必须是 1–65535 的整数')
  }
  const hostPorts = { dev: new Set(), prod: new Set() }
  for (const app of config.apps) {
    name(app.name)
    if (!Object.hasOwn(dockerKinds, app.kind))
      throw new Error('应用类型必须是 static 或 node')
    inside(root, app.app)
    if (config.features.includes('dev')) {
      command(app.devCommand, 'devCommand')
      port(app.devPort)
      port(app.devHostPort)
      if (hostPorts.dev.has(app.devHostPort))
        throw new Error('开发环境宿主机端口重复')
      hostPorts.dev.add(app.devHostPort)
    }
    if (config.features.includes('image')) {
      command(app.buildCommand, 'buildCommand')
      port(app.port)
      port(app.hostPort)
      if (hostPorts.prod.has(app.hostPort))
        throw new Error('生产环境宿主机端口重复')
      hostPorts.prod.add(app.hostPort)
      if (app.kind === 'static') {
        const output = inside(root, app.output)
        const relative = path.relative(output, inside(root, app.app))
        if (!relative || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative)))
          throw new Error('静态产物目录不能包含应用源码')
        if (app.port !== 80)
          throw new Error('当前静态镜像容器端口为 80；请通过 hostPort 调整宿主机端口')
      }
      else {
        command(app.startCommand, 'startCommand')
      }
    }
  }
  for (const service of config.services) {
    name(service.name)
    if (!['image', 'dockerfile'].includes(service.source))
      throw new Error('编排服务来源必须是 image 或 dockerfile')
    if (service.source === 'image' && (typeof service.image !== 'string' || !/^\w[\w./:@-]*$/.test(service.image)))
      throw new Error('必须指定有效的服务镜像')
    if (service.source === 'dockerfile') {
      inside(root, service.dockerfile)
      inside(root, service.context)
    }
    for (const field of ['ports', 'volumes']) {
      if (service[field] && (!Array.isArray(service[field]) || service[field].some(v => typeof v !== 'string' || !v || /[\r\n]/.test(v))))
        throw new Error(`${field} 必须是字符串数组`)
    }
    if (service.environment && (typeof service.environment !== 'object' || Array.isArray(service.environment) || Object.values(service.environment).some(v => !['string', 'number', 'boolean'].includes(typeof v))))
      throw new Error('environment 必须是环境变量映射，敏感值请引用 .env 中的变量')
    if (service.environment && Object.entries(service.environment).some(([key, value]) => !key || /[=\r\n\0]/.test(key) || String(value).includes('\0')))
      throw new Error('环境变量名称或值包含无效字符')
  }
  return config
}
