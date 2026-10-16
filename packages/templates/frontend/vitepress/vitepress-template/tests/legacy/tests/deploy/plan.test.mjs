/* eslint-disable test/no-import-node-test -- 验证实际部署选择条件。 */
import assert from 'node:assert/strict'
import { it } from 'node:test'
import { plan } from '../../scripts/deploy/plan.js'

for (const [target, key] of Object.entries({ pages: 'PAGES_ENABLED', vercel: 'VERCEL_ENABLED', cloudflare: 'CLOUDFLARE_ENABLED', oss: 'OSS_ENABLED', cos: 'COS_ENABLED', server: 'SERVER_DEPLOY_ENABLED' })) {
  it(`${target}: 未配置时解释跳过，开启或手动运行时选择平台`, () => {
    assert.equal(plan(target).selected, false)
    assert.ok(plan(target).reason.includes(key))
    assert.equal(plan(target, { [key]: 'true' }).selected, true)
    assert.equal(plan(target, {}, 'workflow_dispatch').selected, true)
    assert.equal(plan(target, { [key]: 'false' }).selected, false)
  })
}

it('Docker 只创建已启用的发布目标，不创建三个空跑任务', () => {
  assert.deepEqual(plan('docker').matrix.include, [])
  assert.equal(plan('docker').selected, false)
  const selected = plan('docker', { DOCKERHUB_ENABLED: 'true', DOCKERHUB_IMAGE: 'docker.io/team/docs' })
  assert.equal(selected.matrix.include.length, 1)
  assert.equal(selected.matrix.include[0].target, 'dockerhub')
  assert.throws(() => plan('docker', {}, 'workflow_dispatch'), /未选择镜像目标/)
})

it('服务器自动部署必须匹配已启用的镜像目标', () => {
  assert.throws(() => plan('docker', { SERVER_DEPLOY_ENABLED: 'true' }), /未选择镜像目标/)
  assert.throws(() => plan('docker', { SERVER_DEPLOY_ENABLED: 'true', DOCKERHUB_ENABLED: 'true', SERVER_IMAGE: 'other' }), /SERVER_IMAGE/)
  assert.doesNotThrow(() => plan('docker', { SERVER_DEPLOY_ENABLED: 'true', DOCKERHUB_ENABLED: 'true', SERVER_IMAGE: 'docker.io/team/docs', DOCKERHUB_IMAGE: 'docker.io/team/docs' }))
})
