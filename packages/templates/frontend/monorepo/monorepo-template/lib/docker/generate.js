import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateDocker } from './options.js'

const templates = fileURLToPath(new URL('../../templates/features/docker/', import.meta.url))
// JSON-quoted Docker exec arrays and YAML scalars preserve spaces and special characters.
const command = value => JSON.stringify(['sh', '-c', value])
function scalar(value) {
  if (typeof value !== 'string')
    return String(value)
  if (/[\r\n]/.test(value))
    return JSON.stringify(value)
  if (/^[A-Z_./][\w./:-]*$/i.test(value) && !['true', 'false', 'null', '~'].includes(value))
    return value
  return `'${value.replaceAll('\'', '\'\'')}'`
}
export function yaml(value, indent = 0) {
  const pad = ' '.repeat(indent)
  if (Array.isArray(value))
    return value.map(item => `${pad}- ${scalar(item)}`).join('\n')
  return Object.entries(value).map(([key, item]) => {
    if (item && typeof item === 'object') {
      if (!Object.keys(item).length)
        return `${pad}${scalar(key)}: ${Array.isArray(item) ? '[]' : '{}'}`
      return `${pad}${scalar(key)}:\n${yaml(item, indent + 2)}`
    }
    return `${pad}${scalar(key)}: ${scalar(item)}`
  }).join('\n')
}
export function dockerPlan(root, input, projectName) {
  const config = validateDocker(root, input)
  const files = new Map()
  const scripts = {}
  if (!config.features.length)
    return { files, scripts }
  const project = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+/, '') || 'monorepo'
  const read = relative => fs.readFileSync(path.join(templates, relative), 'utf8')
  const render = (relative, values) => read(relative).replace(/__[A-Z_]+__/g, (token) => {
    if (!Object.hasOwn(values, token))
      throw new Error(`Docker 模板变量缺失：${token}`)
    return values[token]
  })
  files.set('.dockerignore', read('_dockerignore'))
  files.set('docker/config.json', `${JSON.stringify({ ...config, project }, null, 2)}\n`)
  if (config.apps.length)
    files.set('scripts/docker/run.mjs', read('shared/scripts/docker/run.mjs'))
  const base = read('shared/base.Dockerfile.tpl').trimEnd()
  const common = {}
  const dev = {}
  const prod = {}
  for (const app of config.apps) {
    const dockerfile = `docker/${app.name}/Dockerfile`
    const parts = [base]
    if (config.features.includes('dev')) {
      parts.push(render('dev/Dockerfile.fragment.tpl', { __DEV_PORT__: app.devPort, __DEV_COMMAND__: command(app.devCommand) }).trimEnd())
      scripts[`docker:dev:${app.name}`] = `node scripts/docker/run.mjs dev ${app.name}`
    }
    if (config.features.includes('image')) {
      parts.push(render(`image/${app.kind}.Dockerfile.fragment.tpl`, { __BUILD_COMMAND__: app.buildCommand, __COPY_OUTPUT__: JSON.stringify([`/repo/${app.output}`, '/usr/share/nginx/html']), __COPY_NGINX__: JSON.stringify([`docker/${app.name}/nginx.conf`, '/etc/nginx/conf.d/default.conf']), __PORT__: app.port, __START_COMMAND__: command(app.startCommand || '') }).trimEnd())
      if (app.kind === 'static')
        files.set(`docker/${app.name}/nginx.conf`, read('image/nginx.conf.tpl'))
      scripts[`docker:build:${app.name}`] = `node scripts/docker/run.mjs build ${app.name} prod`
      scripts[`docker:run:${app.name}`] = `node scripts/docker/run.mjs run ${app.name}`
    }
    else {
      scripts[`docker:build:${app.name}`] = `node scripts/docker/run.mjs build ${app.name} dev`
    }
    files.set(dockerfile, `${parts.join('\n\n')}\n`)
    const production = config.features.includes('image')
    common[app.name] = { build: { context: '..', dockerfile, target: production ? 'prod' : 'dev' }, ports: [`${production ? app.hostPort : app.devHostPort}:${production ? app.port : app.devPort}`] }
    if (config.features.includes('dev'))
      dev[app.name] = { build: { target: 'dev' }, ports: [`${app.devHostPort}:${app.devPort}`], environment: { NODE_ENV: 'development' }, volumes: ['..:/repo', '/repo/node_modules', ...config.apps.map(entry => `/repo/${entry.app}/node_modules`)] }
    if (production)
      prod[app.name] = { build: { target: 'prod' }, ports: [`${app.hostPort}:${app.port}`], restart: 'unless-stopped' }
  }
  for (const service of config.services) {
    common[service.name] = service.source === 'image' ? { image: service.image } : { build: { context: path.posix.join('..', service.context), dockerfile: path.posix.relative(service.context, service.dockerfile) } }
    for (const key of ['ports', 'volumes', 'environment']) {
      if (service[key] && Object.keys(service[key]).length)
        common[service.name][key] = key === 'environment' ? Object.fromEntries(Object.entries(service[key]).map(([k, value]) => [k, String(value)])) : service[key]
    }
  }
  if (config.features.includes('compose')) {
    // Ports live in mode overrides when both stages exist; Compose otherwise merges port arrays.
    if (config.features.includes('dev') && config.features.includes('image')) {
      for (const app of config.apps) delete common[app.name].ports
    }
    let commonText = render('compose/compose.yml.tpl', { __PROJECT__: project, __SERVICES__: yaml(common, 2) })
    const namedVolumes = {}
    for (const service of config.services) {
      for (const volume of service.volumes || []) {
        const source = volume.split(':')[0]
        if (volume.includes(':') && !/^[A-Z]:[\\/]/i.test(volume) && /^[A-Z0-9][\w.-]*$/i.test(source))
          namedVolumes[source] = {}
      }
    }
    if (Object.keys(namedVolumes).length)
      commonText += `volumes:\n${yaml(namedVolumes, 2)}\n`
    files.set('docker/compose.yml', commonText)
    scripts['docker:up'] = config.features.includes('dev') && config.features.includes('image') ? 'docker compose -f docker/compose.yml -f docker/compose.prod.yml up --build' : 'docker compose -f docker/compose.yml up --build'
    scripts['docker:down'] = 'docker compose -f docker/compose.yml down'
    if (Object.keys(dev).length) {
      files.set('docker/compose.dev.yml', render('compose/compose.dev.yml.tpl', { __PROJECT__: project, __SERVICES__: yaml(dev, 2) }))
      scripts['docker:dev'] = 'docker compose -f docker/compose.yml -f docker/compose.dev.yml up --build'
    }
    if (Object.keys(prod).length) {
      files.set('docker/compose.prod.yml', render('compose/compose.prod.yml.tpl', { __PROJECT__: project, __SERVICES__: yaml(prod, 2) }))
      scripts['docker:prod'] = 'docker compose -f docker/compose.yml -f docker/compose.prod.yml up -d --build'
    }
  }
  files.set('docker/README.md', `# Docker 配置\n\n用途：${config.features.join(', ')}。应用及服务参数记录见 config.json，修改时同步 Dockerfile/Compose。配置不创建应用；先在仓库根目录安装依赖并提交锁文件。\n\n${config.apps.map(app => `- ${app.name}：${app.app}（${app.kind}）`).join('\n')}\n\n${Object.entries(scripts).map(([key, value]) => `- pnpm run ${key}：${value}`).join('\n')}\n\n应用须监听 0.0.0.0。独立镜像先 build 再 run；dev 会构建并前台运行。Compose 模式使用 docker:dev / docker:prod；仅编排使用 docker:up。服务名和宿主机端口应唯一。\n\nNode 生产镜像保留 workspace 依赖，不使用不适合通用仓库的 prune。开发挂载仅预置配置应用的依赖目录；新增共享包时按实际情况补充挂载。特殊代理、网络、数据卷和环境变量可以在生成文件中调整；敏感值使用 .env 引用，不写进镜像。不会推送镜像或部署服务器，这些由部署目标负责。\n`)
  return { files, scripts }
}
