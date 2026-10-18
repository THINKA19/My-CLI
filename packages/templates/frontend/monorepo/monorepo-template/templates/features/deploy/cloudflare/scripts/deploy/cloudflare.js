import { required } from './check-config.js'
import { pnpm } from './commands.js'

export async function deploy(root, t, { output }) {
  required(['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'])
  pnpm(['dlx', 'wrangler', 'pages', 'deploy', output, '--project-name', t.project], root)
}
