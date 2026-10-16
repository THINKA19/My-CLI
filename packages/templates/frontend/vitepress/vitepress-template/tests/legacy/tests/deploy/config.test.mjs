/* eslint-disable test/no-import-node-test -- 无需连接云平台的配置回归测试。 */
import assert from 'node:assert/strict'
import { it } from 'node:test'
import { checkConfig, targets } from '../../scripts/deploy/check-config.js'

for (const [target, keys] of Object.entries(targets)) {
  it(`${target}: 完整配置通过，缺失配置明确失败且不输出密钥`, () => {
    const env = Object.fromEntries(keys.map(key => [key, key.endsWith('SITE_URL') ? 'https://example.com/docs' : 'private-value']))
    if (target === 'docker') {
      env.REGISTRY = 'registry.example.com'
      env.IMAGE = 'registry.example.com/team/docs'
    }
    assert.doesNotThrow(() => checkConfig(target, env))
    for (const key of keys) {
      assert.throws(() => checkConfig(target, { ...env, [key]: ' ' }), (error) => {
        assert.ok(error.message.includes(key))
        assert.ok(!error.message.includes('private-value'))
        return true
      })
    }
  })
}

it('拒绝未知平台、带凭据的站点地址和不匹配的镜像仓库', () => {
  assert.throws(() => checkConfig('unknown', {}), /未知部署目标/)
  const env = Object.fromEntries(targets.docker.map(key => [key, 'value']))
  env.SITE_URL = 'https://user:password@example.com'
  assert.throws(() => checkConfig('docker', env), /HTTP/)
  env.SITE_URL = 'https://example.com'
  assert.throws(() => checkConfig('docker', env), /namespace/)
})
