/* eslint-disable test/no-import-node-test -- 验证工作流入口，防止测试因触发条件被跳过。 */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { it } from 'node:test'
import YAML from 'yaml'

async function workflow(file) {
  return YAML.parse(await fs.readFile(new URL(`../../.github/workflows/${file}`, import.meta.url), 'utf8'))
}

it('全平台适配测试在 main 推送、PR 和手动运行时启动，不依赖平台开关', async () => {
  const test = await workflow('test-deploy.yml')
  assert.deepEqual(test.on.push.branches, ['main'])
  assert.deepEqual(test.on.pull_request.branches, ['main'])
  assert.ok(Object.hasOwn(test.on, 'workflow_dispatch'))
  assert.equal(test.jobs.static.if, undefined)
  assert.equal(test.jobs.docker.if, undefined)
  assert.deepEqual(test.jobs.static.strategy.matrix.target, ['pages', 'vercel', 'cloudflare', 'oss', 'cos'])
})

it('所有部署入口执行选择说明，Docker 使用动态目标而不是步骤全部跳过', async () => {
  for (const file of ['release.yml', 'deploy-vercel.yml', 'deploy-cloudflare.yml', 'deploy-aliyun-oss.yml', 'deploy-tencent-cos.yml', 'deploy.yml', 'docker-cloud.yml']) {
    const config = await workflow(file)
    if (file !== 'deploy.yml') {
      assert.deepEqual(config.on.push.branches, ['main'], file)
      assert.equal(config.on.push.paths, undefined, file)
    }
    assert.equal(config.jobs.selection.if, undefined, file)
    assert.ok(config.jobs.selection.steps.some(step => step.run?.startsWith('node scripts/deploy/plan.js ')), file)
    const job = config.jobs.deploy || config.jobs.pages || config.jobs.publish
    assert.equal(job.needs, 'selection', file)
    assert.equal(job.if, 'needs.selection.outputs.selected == \'true\'', file)
  }
  const docker = await workflow('docker-cloud.yml')
  assert.match(docker.jobs.publish.strategy.matrix, /fromJSON\(needs\.selection\.outputs\.matrix\)/)
  assert.ok(docker.jobs.publish.steps.every(step => step.if === undefined))
})
