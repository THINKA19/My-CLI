/* eslint-disable no-console */
import path from 'node:path'
import readline from 'node:readline'
import { enhancements, features, findWorkspace, languages, packageNameFor, registries, targets } from './options.js'

export class Cancelled extends Error {}

export function prompt({ title, choices, multiple = false, initial, defaultValue = '', hint = '', validate = () => undefined }) {
  if (!process.stdin.isTTY || !process.stdout.isTTY)
    throw new Error('交互问答需要终端；自动化调用请使用 --yes 和显式选项，详见 --help')
  const input = process.stdin
  const output = process.stdout
  readline.emitKeypressEvents(input)
  const wasRaw = input.isRaw
  input.setRawMode(true)
  input.resume()
  let index = Math.max(0, choices?.findIndex(choice => choice.value === initial) ?? 0)
  let value = typeof initial === 'string' && !choices ? initial : ''
  const checked = new Set(Array.isArray(initial) ? initial : [])
  for (const choice of choices || []) {
    if (choice.required)
      checked.add(choice.value)
  }
  let rows = 0
  let message = ''
  const draw = () => {
    if (rows)
      output.write(`\x1B[${rows}A\r\x1B[0J`)
    const lines = [`◆ ${title}`]
    if (choices) {
      for (const [i, choice] of choices.entries()) {
        if (choice.group && choice.group !== choices[i - 1]?.group)
          lines.push(`  ${choice.group}`)
        const mark = multiple ? checked.has(choice.value) ? '☑' : '☐' : index === i ? '●' : '○'
        lines.push(`${index === i ? '›' : '│'} ${mark} ${choice.label}${choice.required ? '（必需）' : ''}`)
      }
    }
    else {
      lines.push(`│ ${value || `${defaultValue}（默认）`}`)
    }
    if (hint)
      lines.push(...hint.split('\n').map(line => `│ ${line}`))
    lines.push(`└ ${message || (choices ? multiple ? '↑↓ 移动，Space 勾选，Enter 确认' : '↑↓ 选择，Enter 确认' : 'Enter 确认')}`)
    rows = lines.reduce((total, line) => total + Math.max(1, Math.ceil([...line].reduce((n, char) => n + (char.codePointAt(0) > 0xFF ? 2 : 1), 0) / (output.columns || 80))), 0)
    output.write(`${lines.join('\n')}\n`)
  }
  return new Promise((resolve, reject) => {
    function cleanup() {
      input.removeListener('keypress', onKey)
      input.removeListener('end', onEnd)
      input.removeListener('error', onError)
      input.setRawMode(Boolean(wasRaw))
      input.pause()
      output.write('\x1B[?25h')
    }
    function onEnd() {
      cleanup()
      reject(new Cancelled('已取消'))
    }
    function onError(error) {
      cleanup()
      reject(error)
    }
    function onKey(str, key = {}) {
      if ((key.ctrl && key.name === 'c') || key.name === 'escape') {
        onEnd()
        return
      }
      message = ''
      if (key.name === 'return') {
        const result = choices
          ? multiple
            ? choices.filter(choice => checked.has(choice.value)).map(choice => choice.value)
            : choices[index].value
          : value.trim() || defaultValue
        message = validate(result) || ''
        if (message) {
          draw()
          return
        }
        cleanup()
        resolve(result)
        return
      }
      if (choices) {
        if (key.name === 'up')
          index = (index - 1 + choices.length) % choices.length
        if (key.name === 'down')
          index = (index + 1) % choices.length
        if (multiple && key.name === 'space' && !choices[index].required) {
          const selected = choices[index].value
          if (checked.has(selected))
            checked.delete(selected)
          else checked.add(selected)
        }
      }
      else if (key.name === 'backspace') {
        value = [...value].slice(0, -1).join('')
      }
      else if (key.ctrl && key.name === 'u') {
        value = ''
      }
      else if (str && !key.ctrl && !key.meta && [...str].every(char => char.codePointAt(0) >= 32 && char.codePointAt(0) !== 127)) {
        value += str
      }
      draw()
    }
    input.on('keypress', onKey)
    input.once('end', onEnd)
    input.once('error', onError)
    output.write('\x1B[?25l')
    draw()
  })
}

const choicesFor = values => Object.entries(values).map(([value, label]) => ({ value, label: typeof label === 'string' ? label : label.label }))

export async function collectOptions(previous = {}, ask = prompt) {
  const location = await ask({ title: '项目创建位置', initial: previous.location === '.' ? '' : previous.location ?? '', defaultValue: '.', hint: '输入 my-docs：新建 my-docs 文件夹\n输入 . 或直接回车：在当前目录创建\n也支持 apps/docs 等相对路径；Ctrl+U 清空输入' }) || '.'
  const workspace = findWorkspace(path.resolve(location))
  if (workspace)
    console.log(`\n检测到 workspace：${workspace.root}。依赖由根目录管理；Git hooks、CI/CD 和 Docker 应由根目录接入。\n`)
  const i18n = await ask({ title: '是否启用国际化多语言？', choices: [{ value: false, label: '否，创建单语言站点' }, { value: true, label: '是，创建多语言站点' }], initial: previous.i18n ?? false })
  let selectedLanguages
  let defaultLanguage
  if (i18n) {
    selectedLanguages = await ask({ title: '需要支持哪些语言？', choices: choicesFor(languages), multiple: true, initial: previous.i18n ? previous.languages : ['zh', 'en'], hint: '至少选择两种语言', validate: values => values.length < 2 ? '请至少选择两种语言' : undefined })
    defaultLanguage = await ask({ title: '默认语言', choices: choicesFor(languages).filter(choice => selectedLanguages.includes(choice.value)), initial: selectedLanguages.includes(previous.defaultLanguage) ? previous.defaultLanguage : selectedLanguages[0] })
  }
  else {
    defaultLanguage = await ask({ title: '站点语言', choices: choicesFor(languages), initial: previous.defaultLanguage ?? 'zh' })
    selectedLanguages = [defaultLanguage]
  }
  const selectedFeatures = await ask({ title: '需要哪些代码质量与检查功能？', choices: choicesFor(features), multiple: true, initial: previous.features ?? [], hint: '可全部不选；Git 提交检查仅在同时选 ESLint 时检查暂存文件' })
  const selectedEnhancements = await ask({ title: '需要哪些内容与交互增强？', choices: choicesFor(enhancements), multiple: true, initial: previous.enhancements ?? [], hint: '可全部不选' })
  const deploy = await ask({ title: '选择部署目标与容器支持', choices: [...choicesFor(targets).map(choice => ({ ...choice, group: '网站部署' })), { value: 'docker', label: 'Docker 本地构建与预览', group: '本地容器' }], multiple: true, initial: [...(previous.targets ?? []), ...(previous.docker ? ['docker'] : [])], hint: '可全部不选；仅生成配置，不立即部署' })
  const selectedTargets = deploy.filter(value => value !== 'docker')
  const docker = deploy.includes('docker') || deploy.includes('server')
  const required = selectedTargets.filter(target => ['github-pages', 'server'].includes(target))
  let automation = required
  if (selectedTargets.some(target => !required.includes(target))) {
    automation = await ask({ title: '为哪些目标生成 GitHub Actions 自动部署工作流？', choices: choicesFor(targets).filter(choice => selectedTargets.includes(choice.value)).map(choice => ({ ...choice, required: required.includes(choice.value) })), multiple: true, initial: [...required, ...(previous.automation ?? []).filter(target => selectedTargets.includes(target))], hint: '未勾选的目标仅提供现有脚本或平台接入说明；避免与平台 Git 自动部署重复启用' })
  }
  else if (required.length) {
    console.log('\n已选目标沿用现有 GitHub Actions 部署流程。\n')
  }
  let selectedRegistries = []
  if (docker) {
    let publish = deploy.includes('server')
    if (!publish)
      publish = await ask({ title: '是否生成镜像发布工作流？', choices: [{ value: false, label: '不需要，仅本地构建与预览' }, { value: true, label: '需要，选择镜像仓库' }], initial: Boolean(previous.registries?.length) })
    if (publish)
      selectedRegistries = await ask({ title: '选择镜像仓库', choices: choicesFor(registries), multiple: true, initial: previous.registries ?? [], hint: '至少选择一个；自有服务器会自动包含 Docker 支持', validate: values => values.length ? undefined : '请至少选择一个镜像仓库' })
  }
  const install = await ask({ title: '是否立即安装依赖？', choices: [{ value: false, label: '暂不安装' }, { value: true, label: workspace ? '在 workspace 根目录安装' : '立即安装' }], initial: previous.install ?? false })
  return { location, i18n, languages: selectedLanguages, defaultLanguage, features: selectedFeatures, enhancements: selectedEnhancements, targets: selectedTargets, docker, automation, registries: selectedRegistries, install, packageName: previous.packageName && previous.packageName !== packageNameFor(path.resolve(previous.location || '.')) ? previous.packageName : packageNameFor(path.resolve(location)) }
}

export function summary(plan) {
  const o = plan.options
  const labels = (values, catalog) => values.map(value => typeof catalog[value] === 'string' ? catalog[value] : catalog[value].label).join('、') || '无'
  return `\n创建位置：${plan.target}\n包名：${plan.packageName}\n国际化：${o.i18n ? '启用' : '关闭'}\n支持语言：${labels(o.languages, languages)}\n默认语言：${languages[o.defaultLanguage].label}\n代码检查：${labels(o.features, features)}\n内容增强：${labels(o.enhancements, enhancements)}\n部署目标：${labels(o.targets, targets)}\nGitHub Actions 自动部署：${labels(o.automation, targets)}\nDocker：${o.docker ? '包含' : '不包含'}\n镜像发布：${labels(o.registries, registries)}\n安装依赖：${o.install ? '立即安装' : '暂不安装'}${plan.workspace ? `\nWorkspace 根目录：${plan.workspace.root}` : ''}\n`
}
