import { defaultDockerApp, dockerFeatures, dockerKinds, normalizeDocker } from './options.js'

const yesNo = [{ value: false, label: '不添加' }, { value: true, label: '继续添加' }]
export async function collectDockerOptions(previous, ask) {
  const old = normalizeDocker(previous)
  const features = await ask({ title: '选择 Docker 配置', multiple: true, choices: Object.entries(dockerFeatures).map(([value, label]) => ({ value, label })), initial: old.features, hint: '可全部不选；按实际用途生成配置，不创建业务应用' })
  if (!features.length)
    return { features: [], apps: [], services: [] }
  const apps = []
  const services = []
  const field = (original, key, title, fallback = '') => ask({ title, initial: original[key] ?? fallback, defaultValue: String(original[key] ?? fallback) })
  if (features.some(f => ['dev', 'image'].includes(f))) {
    let index = 0
    do {
      const previousApp = old.apps[index] || {}
      const kind = await ask({ title: '容器应用类型', choices: Object.entries(dockerKinds).map(([value, label]) => ({ value, label })), initial: previousApp.kind || 'static' })
      const original = { ...defaultDockerApp(kind), ...previousApp, kind }
      const name = await field(original, 'name', '容器应用名称（唯一）')
      const app = await field(original, 'app', '应用目录（相对仓库根）')
      const packageName = await field(original, 'package', '应用包名（用于命令默认值）')
      const t = { name, kind, app, package: packageName }
      if (features.includes('dev')) {
        t.devCommand = await field(previousApp, 'devCommand', '开发启动命令（服务需监听 0.0.0.0）', `pnpm --filter ${packageName} dev${kind === 'static' ? ' --host 0.0.0.0' : ''}`)
        t.devPort = Number(await field(original, 'devPort', '开发容器端口'))
        t.devHostPort = Number(await field(original, 'devHostPort', '开发宿主机端口'))
      }
      if (features.includes('image')) {
        t.buildCommand = await field(previousApp, 'buildCommand', '生产构建命令', `pnpm --filter ${packageName}... build`)
        if (kind === 'static')
          t.output = await field(previousApp, 'output', '静态产物目录（相对仓库根）', `${app}/dist`)
        else t.startCommand = await field(previousApp, 'startCommand', '生产启动命令', `node ${app}/dist/index.js`)
        t.port = kind === 'static' ? 80 : Number(await field(original, 'port', '生产容器端口'))
        t.hostPort = Number(await field(original, 'hostPort', '生产宿主机端口'))
      }
      apps.push(t)
      index++
    } while (await ask({ title: '继续配置另一个应用容器？', choices: yesNo, initial: index < old.apps.length }))
  }
  if (features.includes('compose')) {
    let add = !apps.length || await ask({ title: '添加引用已有镜像或 Dockerfile 的编排服务？', choices: yesNo, initial: old.services.length > 0 })
    let index = 0
    while (add) {
      const original = old.services[index] || {}
      const source = await ask({ title: '编排服务来源', choices: [{ value: 'image', label: '已有镜像' }, { value: 'dockerfile', label: '已有 Dockerfile' }], initial: original.source || 'image' })
      const t = { name: await field(original, 'name', '编排服务名称', 'service'), source }
      if (source === 'image') {
        t.image = await field(original, 'image', '镜像地址及标签')
      }
      else {
        t.dockerfile = await field(original, 'dockerfile', '已有 Dockerfile 路径')
        t.context = await field(original, 'context', '构建上下文', '.')
      }
      const ports = await field(original, 'ports', '端口映射，逗号分隔，可留空')
      const volumes = await field(original, 'volumes', '挂载，逗号分隔，可留空')
      t.ports = Array.isArray(ports) ? ports : ports ? ports.split(',').map(v => v.trim()) : []
      t.volumes = Array.isArray(volumes) ? volumes : volumes ? volumes.split(',').map(v => v.trim()) : []
      if (original.environment)
        t.environment = original.environment
      services.push(t)
      index++
      add = await ask({ title: '继续配置另一个编排服务？', choices: yesNo, initial: index < old.services.length })
    }
  }
  return { features, apps, services }
}
