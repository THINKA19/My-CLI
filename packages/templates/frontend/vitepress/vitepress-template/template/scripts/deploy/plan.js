import fs from 'node:fs'
import { pathToFileURL } from 'node:url'

const switches = {
  pages: 'PAGES_ENABLED',
  vercel: 'VERCEL_ENABLED',
  cloudflare: 'CLOUDFLARE_ENABLED',
  oss: 'OSS_ENABLED',
  cos: 'COS_ENABLED',
  server: 'SERVER_DEPLOY_ENABLED',
}

export function plan(target, vars = {}, event = 'push') {
  if (target === 'docker') {
    const include = [
      ['aliyun', 'ALIYUN_DOCKER_ENABLED', 'ALIYUN_ACR_REGISTRY', 'ALIYUN_DOCKER_IMAGE', 'ALIYUN_SITE_URL', 'ALIYUN_BASE', 'ALIYUN_REGISTRY_USERNAME', 'ALIYUN_REGISTRY_PASSWORD'],
      ['tencent', 'TENCENT_DOCKER_ENABLED', 'TENCENT_CCR_REGISTRY', 'TENCENT_DOCKER_IMAGE', 'TENCENT_SITE_URL', 'TENCENT_BASE', 'TENCENT_REGISTRY_USERNAME', 'TENCENT_REGISTRY_PASSWORD'],
      ['dockerhub', 'DOCKERHUB_ENABLED', null, 'DOCKERHUB_IMAGE', 'DOCKERHUB_SITE_URL', 'DOCKERHUB_BASE', 'DOCKERHUB_USERNAME', 'DOCKERHUB_TOKEN'],
    ].filter(([, key]) => vars[key] === 'true').map(([name, , registry, image, url, base, user, password]) => ({
      target: name,
      registry: registry ? vars[registry] || '' : 'docker.io',
      image: vars[image] || '',
      site_url: vars[url] || '',
      base: vars[base] || '/',
      username_secret: user,
      password_secret: password,
    }))
    if (!include.length && (event === 'workflow_dispatch' || vars.SERVER_DEPLOY_ENABLED === 'true'))
      throw new Error('未选择镜像目标：请开启 ALIYUN_DOCKER_ENABLED、TENCENT_DOCKER_ENABLED 或 DOCKERHUB_ENABLED')
    if (vars.SERVER_DEPLOY_ENABLED === 'true' && !include.some(item => item.image === vars.SERVER_IMAGE))
      throw new Error('SERVER_IMAGE 必须对应已启用的镜像目标')
    return { selected: include.length > 0, matrix: { include }, reason: include.length ? '已选择镜像目标；发布结果请查看 publish 任务' : '未启用镜像目标：未构建、未推送，不能计为部署成功' }
  }
  if (!Object.hasOwn(switches, target))
    throw new Error(`未知部署目标: ${target}`)
  const selected = vars[switches[target]] === 'true' || event === 'workflow_dispatch'
  return { selected, reason: selected ? '已选择该平台；部署结果请查看部署任务' : `${switches[target]} 未设置为 true：未执行部署；全平台适配测试独立运行` }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = plan(process.argv[2], JSON.parse(process.env.DEPLOY_VARS || '{}'), process.env.DEPLOY_EVENT)
    console.log(result.reason)
    if (process.env.GITHUB_OUTPUT)
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `selected=${result.selected}\nmatrix=${JSON.stringify(result.matrix || {})}\n`)
    if (process.env.GITHUB_STEP_SUMMARY)
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## 部署选择 / ${process.argv[2]}\n\n${result.reason}\n`)
  }
  catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
