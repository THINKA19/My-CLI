import { required } from './check-config.js'
import { command } from './commands.js'
import { inside } from './files.js'

export async function deploy(root, t) {
  required(['REGISTRY_USER', 'REGISTRY_PASSWORD'])
  const registry = t.image.split('/')[0]
  command('docker', ['login', registry, '--username', process.env.REGISTRY_USER, '--password-stdin'], { input: process.env.REGISTRY_PASSWORD, stdio: ['pipe', 'inherit', 'inherit'] })
  command('docker', ['build', '-f', inside(root, t.dockerfile), '-t', t.image, inside(root, t.context)])
  command('docker', ['push', t.image])
}
