import { pathToFileURL } from 'node:url'

export const targets = {
  pages: [],
  vercel: ['VERCEL_SITE_URL', 'VERCEL_TOKEN', 'VERCEL_ORG_ID', 'VERCEL_PROJECT_ID'],
  cloudflare: ['CLOUDFLARE_SITE_URL', 'CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_PROJECT_NAME'],
  oss: ['OSS_SITE_URL', 'OSS_REGION', 'OSS_BUCKET', 'OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET'],
  cos: ['COS_SITE_URL', 'COS_REGION', 'COS_BUCKET', 'COS_SECRET_ID', 'COS_SECRET_KEY'],
  docker: ['REGISTRY', 'IMAGE', 'SITE_URL', 'REGISTRY_USER', 'REGISTRY_PASSWORD'],
  server: ['SERVER_IMAGE', 'SERVER_HOST', 'SERVER_USER', 'SERVER_SSH_KEY', 'SERVER_FINGERPRINT', 'SERVER_REGISTRY', 'SERVER_REGISTRY_USERNAME', 'SERVER_REGISTRY_PASSWORD'],
}

export function checkConfig(target, env = process.env) {
  if (!Object.hasOwn(targets, target))
    throw new Error(`未知部署目标: ${target}`)
  const missing = targets[target].filter(key => !env[key]?.trim())
  if (missing.length)
    throw new Error(`${target} 缺少配置: ${missing.join(', ')}`)
  const urlKey = targets[target].find(key => key.endsWith('SITE_URL'))
  if (urlKey) {
    const url = new URL(env[urlKey])
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.search || url.hash)
      throw new Error(`${urlKey} 必须是无凭据、查询参数和锚点的 HTTP(S) 地址`)
  }
  if (target === 'docker' && !env.IMAGE.startsWith(`${env.REGISTRY}/`))
    throw new Error('IMAGE 必须包含匹配的 registry 和 namespace')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    checkConfig(process.argv[2])
    console.log(`${process.argv[2]} 配置检查通过；尚未验证云端权限或实际部署`)
  }
  catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
