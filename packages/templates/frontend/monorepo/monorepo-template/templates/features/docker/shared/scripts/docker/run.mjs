import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const config = JSON.parse(fs.readFileSync(path.join(root, 'docker/config.json'), 'utf8'))
const [action, name, ...extra] = process.argv.slice(2)
function docker(args) {
  const result = spawnSync('docker', args, { cwd: root, stdio: 'inherit' })
  if (result.error || result.status !== 0)
    throw new Error(`Docker 执行失败 (${result.status})`, { cause: result.error })
}
try {
  const app = config.apps.find(app => app.name === name)
  if (!app || !['build', 'dev', 'run'].includes(action))
    throw new Error('用法：run.mjs build 名称 dev|prod；dev 名称；run 名称')
  const mode = action === 'dev' ? 'dev' : action === 'run' ? 'prod' : extra[0]
  if (!['dev', 'prod'].includes(mode) || extra.length > (action === 'build' ? 1 : 0))
    throw new Error('无效 Docker 参数')
  if (!config.features.includes(mode === 'dev' ? 'dev' : 'image'))
    throw new Error('未选择对应 Docker 用途')
  const tag = `${config.project}/${app.name}:${mode}`
  if (action !== 'run')
    docker(['build', '--target', mode, '-f', `docker/${app.name}/Dockerfile`, '-t', tag, '.'])
  if (action === 'dev') {
    const volumes = ['--mount', `type=bind,source=${root},target=/repo`, '--volume', '/repo/node_modules']
    for (const entry of config.apps) volumes.push('--volume', `/repo/${entry.app}/node_modules`)
    docker(['run', '--rm', '-it', '--name', `${config.project}-${name}-dev`, '-p', `${app.devHostPort}:${app.devPort}`, ...volumes, tag])
  }
  if (action === 'run')
    docker(['run', '-d', '--restart', 'unless-stopped', '--name', `${config.project}-${name}-prod`, '-p', `${app.hostPort}:${app.port}`, tag])
}
catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
