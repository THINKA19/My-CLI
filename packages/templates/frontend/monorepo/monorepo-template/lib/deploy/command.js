/* eslint-disable no-console */
import path from 'node:path'
import { inside, json, namePattern, read } from '../../templates/features/deploy/shared/scripts/deploy/files.js'
import { runTarget } from '../../templates/features/deploy/shared/scripts/deploy/run.js'
import { collectTarget, prompt } from '../prompts.js'
import { listTargets, removeTarget, saveTarget } from './targets.js'

export async function manage(args, root = process.cwd()) {
  const [action, name, ...flags] = args
  if (['--help', '-h'].includes(action)) {
    console.log('deploy add [--config 文件] | list | edit 名称 [--config 文件] | remove 名称 | run 名称 [--dry-run]')
    return
  }
  if (action === 'list' && args.length !== 1)
    throw new Error('list 不接受额外参数')
  if (action === 'run' && (!namePattern.test(name || '') || flags.some(f => f !== '--dry-run')))
    throw new Error('run 参数错误，只支持目标名称和 --dry-run')
  if (action === 'remove' && args.length !== 2)
    throw new Error('remove 需要且只接受一个目标名称')
  if (action === 'list') {
    console.table(listTargets(root).map(({ name, app, platform, environment }) => ({ name, app, platform, environment })))
    return
  }
  if (action === 'run')
    return runTarget(root, name, flags.includes('--dry-run'))
  if (action === 'remove')
    return removeTarget(root, name)
  if (!['add', 'edit'].includes(action))
    throw new Error('用法：deploy add|edit [--config 文件]；list；remove 名称；run 名称 [--dry-run]')
  const configAt = args.indexOf('--config')
  const expected = action === 'add' ? 1 : 2
  if (args.length !== expected + (configAt === -1 ? 0 : 2) || (configAt !== -1 && configAt !== expected))
    throw new Error('参数错误：add [--config 文件] 或 edit 名称 [--config 文件]')
  if (action === 'edit' && !namePattern.test(name || ''))
    throw new Error('无效目标名称')
  let target
  if (configAt !== -1) {
    if (!args[configAt + 1])
      throw new Error('--config 缺少文件路径')
    target = read(path.resolve(args[configAt + 1]))
  }
  else {
    if (!process.stdin.isTTY)
      throw new Error('非交互模式请使用 --config 文件')
    const original = action === 'edit' ? read(inside(path.resolve(root), `deploy/targets/${name}.json`)) : {}
    target = await collectTarget(undefined, original)
    console.log(json(target))
    const confirmed = await prompt({ title: '确认保存？', choices: [{ value: false, label: '取消' }, { value: true, label: '保存' }], initial: false })
    if (!confirmed)
      return
  }
  if (action === 'edit' && name && name !== '--config' && target.name !== name)
    throw new Error('修改时不能重命名目标')
  saveTarget(root, target, action === 'edit')
}
