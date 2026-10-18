import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from './build.js'
import { validate } from './check-config.js'
import { inside, json, namePattern, read } from './files.js'
import { verifyOutput } from './verify-output.js'

export async function runTarget(root, name, dryRun = false) {
  root = path.resolve(root)
  if (!namePattern.test(name || ''))
    throw new Error('无效目标名称')
  const t = validate(root, read(inside(root, `deploy/targets/${name}.json`)))
  if (dryRun) {
    console.log(json(t))
    return
  }
  if (t.platform === 'github-pages' && process.env.GITHUB_ACTIONS !== 'true')
    throw new Error('GitHub Pages 请通过生成的 GitHub Actions 工作流发布')
  build(root, t)
  const artifact = ['registry', 'server'].includes(t.platform) ? {} : verifyOutput(root, t)
  const adapter = await import(pathToFileURL(inside(root, `scripts/deploy/${t.platform}.js`)))
  await adapter.deploy(root, t, artifact)
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [name, ...flags] = process.argv.slice(2)
  if (flags.some(f => f !== '--dry-run')) {
    console.error('未知执行参数')
    process.exitCode = 1
  }
  else {
    runTarget(process.cwd(), name, flags.includes('--dry-run')).catch((error) => {
      console.error(error.message)
      process.exitCode = 1
    })
  }
}
