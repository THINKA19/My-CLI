import fs from 'node:fs'
import path from 'node:path'
import { required } from './check-config.js'
import { command } from './commands.js'

export async function deploy(root, t) {
  required(['SERVER_HOST', 'SERVER_USER', 'SERVER_SSH_KEY', 'SERVER_KNOWN_HOSTS'])
  if (!/^[a-z0-9.-]+$/i.test(process.env.SERVER_HOST) || !/^[\w-]+$/.test(process.env.SERVER_USER))
    throw new Error('SSH 主机或用户名不合法')
  const tmp = fs.mkdtempSync(path.join((await import('node:os')).tmpdir(), 'deploy-ssh-'))
  try {
    fs.writeFileSync(path.join(tmp, 'key'), process.env.SERVER_SSH_KEY, { mode: 0o600 })
    fs.writeFileSync(path.join(tmp, 'known_hosts'), process.env.SERVER_KNOWN_HOSTS)
    // Server must already have Docker and registry credentials. Optional runArgs are explicit configuration.
    const quote = s => `'${String(s).replaceAll('\'', '\'\\\'\'')}'`
    const script = `set -eu\ndocker pull ${quote(t.image)}\ndocker rm -f ${quote(t.container)} || true\ndocker run -d --restart unless-stopped --name ${quote(t.container)} ${(t.runArgs || []).map(quote).join(' ')} ${quote(t.image)}\n`
    command('ssh', ['-i', path.join(tmp, 'key'), '-o', `UserKnownHostsFile=${path.join(tmp, 'known_hosts')}`, '-o', 'StrictHostKeyChecking=yes', `${process.env.SERVER_USER}@${process.env.SERVER_HOST}`, 'sh', '-s'], { input: script, stdio: ['pipe', 'inherit', 'inherit'] })
  }
  finally { fs.rmSync(tmp, { recursive: true, force: true }) }
}
