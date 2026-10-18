import { required } from './check-config.js'
import { pnpm } from './commands.js'
import { prepareVercel } from './prepare-vercel.js'

export async function deploy(root, t, { output }) {
  required(['VERCEL_TOKEN', 'VERCEL_ORG_ID', 'VERCEL_PROJECT_ID'])
  const stage = prepareVercel(root, t, output)
  pnpm(['dlx', 'vercel', 'deploy', '--prebuilt', '--prod', '--yes', '--token', process.env.VERCEL_TOKEN], stage)
}
