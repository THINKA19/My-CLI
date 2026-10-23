/* eslint-disable test/no-import-node-test -- CLI tests use the Node.js runner */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { featureGroups, featureModules, featuresInGroup } from '../lib/features.js'
import { collectOptions, summary } from '../lib/prompts.js'

const basic = ['code-quality', 'unit-test', 'e2e', 'jsx']
const enhanced = ['theme', 'i18n', 'tools', 'analyze', 'diagnostics', 'deployment']
test('feature categories have separate module directories and stable ordering', () => {
  assert.deepEqual(featureGroups, { basic: '基础开发配置', enhanced: '通用功能增强' })
  assert.deepEqual(featuresInGroup('basic'), basic)
  assert.deepEqual(featuresInGroup('enhanced'), enhanced)
  for (const module of Object.values(featureModules)) {
    assert.ok(Object.hasOwn(featureGroups, module.group))
    assert.ok(fs.existsSync(new URL(`../templates/features/${module.group}/${module.directory}/package.fragment.json`, import.meta.url)))
  }
})
for (const [name, selectedBasic, selectedEnhanced] of [
  ['none', [], []],
  ['basic only', basic, []],
  ['enhanced only', [], enhanced],
  ['both', basic, enhanced],
]) {
  test(`independent feature selection: ${name}`, async () => {
    const questions = []
    const result = await collectOptions({}, async (question) => {
      questions.push(question)
      if (question.title === '项目创建位置')
        return 'grouped-app'
      if (question.title === '选择基础开发配置')
        return selectedBasic
      if (question.title === '选择通用功能增强')
        return selectedEnhanced
      if (question.title === '确认配置')
        return 'create'
      return question.initial
    })
    assert.deepEqual(result.features, [...selectedBasic, ...selectedEnhanced])
    assert.deepEqual(questions.slice(4, 6).map(q => q.title), ['选择基础开发配置', '选择通用功能增强'])
    for (const question of questions.slice(4, 6)) {
      assert.equal(question.multiple, true)
      assert.deepEqual(question.initial, [])
    }
    const text = summary(result)
    assert.ok(text.includes('基础开发配置：'))
    assert.ok(text.includes('通用功能增强：'))
    assert.ok(!text.includes('可选功能：'))
  })
}
