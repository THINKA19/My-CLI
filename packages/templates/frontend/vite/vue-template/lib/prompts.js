/* eslint-disable no-console */

import path from 'node:path'
/**
 * 命令行交互问答模块
 *
 * 作用：
 *   为脚手架提供终端交互能力，并把问答结果整理成创建计划所需的选项。
 *   bin 入口只负责调用，所有输入框、单选、多选的渲染和按键处理都在本文件。
 *
 * 导出：
 *   Cancelled      用户主动取消（Ctrl+C / Esc / 输入流结束）时抛出的异常
 *   prompt         通用交互组件，支持三种形式：
 *                    - 文本输入（不传 choices）
 *                    - 单选（传 choices）
 *                    - 多选（传 choices 且 multiple: true）
 *   collectOptions 配置向导，按顺序提问并处理选项之间的联动
 *   summary        把创建计划整理成确认页的文字摘要
 *
 * 实现要点：
 *   - 基于 Node 原生 readline 的按键事件，开启 Raw 模式后自行绘制界面，不依赖第三方库。
 *   - 当前问题限制在终端可视高度内，长列表随当前选项滚动；完成后收起为一行摘要。
 *   - 选中状态用符号和颜色双重表示：即使终端不支持颜色，符号也能区分选中与否。
 *   - 颜色在 NO_COLOR 环境变量存在时自动关闭。
 *
 * 终端兼容：
 *   多选符号曾使用 ☑ / ☐，在部分 Windows 终端字体里 ☑ 缺失，显示成空方块，
 *   多选统一使用 ASCII 字符 [+] / [ ]，单选保留圆形符号。
 */
import readline from 'node:readline'
import { httpLibraries } from './http.js'
import { featureLabels, normalizeOptions } from './options.js'
import { projectTypes } from './project-types.js'
import { uiLibraries } from './ui.js'

/** 用户主动中断（Ctrl+C 或 Esc）时抛出，由调用方统一捕获 */
export class Cancelled extends Error {}

// ---------------------------------------------------------------------------
// 显示样式
// ---------------------------------------------------------------------------

// 多选框符号（已选 / 未选）
const MARK_ON = '[+]'
const MARK_OFF = '[ ]'
// 单选框符号（当前项 / 其他项）
const RADIO_ON = '●'
const RADIO_OFF = '○'

const useColor = !process.env.NO_COLOR
const paint = code => text => (useColor ? `\x1B[${code}m${text}\x1B[0m` : text)
const green = paint(32)
const cyan = paint(36)
const red = paint(31)
const gray = paint(90)

// 去掉颜色转义序列，用于计算真实显示宽度
// eslint-disable-next-line no-control-regex
const stripAnsi = text => text.replace(/\x1B\[[0-9;]*m/g, '')

// 单个字符的显示宽度：中日韩、全角字符和表情占 2 格，其余占 1 格
function charWidth(char) {
  const code = char.codePointAt(0)
  if (/\p{Mark}/u.test(char) || code === 0x200D)
    return 0
  const wide
    = (code >= 0x1100 && code <= 0x115F)
      || (code >= 0x2E80 && code <= 0xA4CF)
      || (code >= 0xAC00 && code <= 0xD7A3)
      || (code >= 0xF900 && code <= 0xFAFF)
      || (code >= 0xFE30 && code <= 0xFE6F)
      || (code >= 0xFF00 && code <= 0xFF60)
      || (code >= 0xFFE0 && code <= 0xFFE6)
      || (code >= 0x1F300 && code <= 0x1F64F)
      || (code >= 0x20000 && code <= 0x3FFFD)
  return wide ? 2 : 1
}

// 每行保留一格，避免行尾自动换行使光标回退行数失真；不截断颜色转义序列。
function fitLine(line, columns) {
  const limit = Math.max(1, columns - 1)
  if ([...stripAnsi(line)].reduce((width, char) => width + charWidth(char), 0) <= limit)
    return line
  let result = ''
  let width = 0
  // eslint-disable-next-line no-control-regex
  for (const token of line.match(/\x1B\[[0-9;]*m|[\s\S]/gu) || []) {
    if (token.startsWith('\x1B')) {
      result += token
      continue
    }
    width += charWidth(token)
    if (width > limit - 1)
      break
    result += token
  }
  return `${result}…\x1B[0m`
}

// ---------------------------------------------------------------------------
// 通用交互组件
// ---------------------------------------------------------------------------

/**
 * 显示一个交互问题并返回用户的回答。
 *
 * 参数：
 *   title         问题标题
 *   choices       选项数组 [{ value, label, group?, required? }]；不传则为文本输入
 *   multiple      是否多选（需要 choices）
 *   initial       初始值：单选为某个 value，多选为 value 数组，文本为字符串
 *   defaultValue  文本输入留空时使用的默认值
 *   hint          标题下方的多行提示
 *   validate      校验函数，返回错误文字则不允许提交
 *
 * 返回：文本为字符串，单选为选中的 value，多选为选中的 value 数组。
 * 非终端环境会直接抛错，提示改用 --yes 和显式选项。
 */
export function prompt({ title, choices, multiple = false, initial, defaultValue = '', hint = '', validate = () => undefined }) {
  if (!process.stdin.isTTY || !process.stdout.isTTY)
    throw new Error('交互问答需要终端；自动化调用请使用 --yes 和显式选项，详见 --help')

  const input = process.stdin
  const output = process.stdout
  readline.emitKeypressEvents(input)
  const wasRaw = input.isRaw

  // Raw 模式：接管按键事件，阻止终端默认回显
  input.setRawMode(true)
  input.resume()

  let index = Math.max(0, choices?.findIndex(choice => choice.value === initial) ?? 0)
  let value = typeof initial === 'string' && !choices ? initial : ''
  const checked = new Set(Array.isArray(initial) ? initial : [])

  // 必选项始终处于选中状态
  for (const choice of choices || []) {
    if (choice.required)
      checked.add(choice.value)
  }
  let rows = 0
  let message = ''
  let offset = 0
  let columns = output.columns || 80

  const clearFrame = () => {
    if (rows) {
      output.write(`\x1B[${rows}A\r\x1B[0J`)
      rows = 0
    }
  }

  // 最后一行留给光标，整个活动问题始终处于可见屏幕中，不回退到历史缓冲区。
  const draw = (resized = false) => {
    const height = Math.max(1, (output.rows || 24) - 1)
    const nextColumns = Math.max(2, output.columns || 80)
    if (resized && (nextColumns !== columns || rows > height)) {
      // 改变宽度会使旧输出重新折行，缩小高度也可能丢失旧起点，不能再按旧行数回退。
      output.write('\x1B[H\x1B[2J')
      rows = 0
    }
    else {
      clearFrame()
    }
    columns = nextColumns

    const entries = []
    let activeRow = 0
    if (choices) {
      for (const [i, choice] of choices.entries()) {
        if (choice.group && choice.group !== choices[i - 1]?.group)
          entries.push(`  ${gray(choice.group)}`)

        const active = index === i
        if (active)
          activeRow = entries.length
        const selected = multiple ? checked.has(choice.value) : active
        const on = multiple ? MARK_ON : RADIO_ON
        const off = multiple ? MARK_OFF : RADIO_OFF
        const mark = selected ? green(on) : gray(off)
        const pointer = active ? cyan('›') : gray('│')
        const label = active ? cyan(choice.label) : choice.label
        const required = choice.required ? gray('（必需）') : ''
        entries.push(`${pointer} ${mark} ${label}${required}`)
      }
    }
    else {
      entries.push(`${gray('│')} ${value || gray(`${defaultValue}（默认）`)}`)
    }

    const hints = hint ? hint.split('\n').slice(0, Math.max(0, height - 5)).map(line => `${gray('│')} ${gray(line)}`) : []
    const tip = choices ? (multiple ? '↑↓ 移动，Space 勾选，Enter 确认' : '↑↓ 选择，Enter 确认') : 'Enter 确认'
    let lines
    if (height < 3) {
      // 极小窗口优先保留当前选项；两行可用时同时显示校验或操作提示。
      lines = [entries[activeRow]]
      if (height === 2)
        lines.push(`${gray('└')} ${message ? red(message) : gray(tip)}`)
    }
    else {
      const budget = height - hints.length - 2
      const overflow = entries.length > budget
      const indicators = overflow && budget >= 3
      const capacity = indicators ? budget - 2 : budget
      offset = Math.max(0, Math.min(offset, activeRow, entries.length - capacity))
      if (activeRow >= offset + capacity)
        offset = activeRow - capacity + 1
      const visible = entries.slice(offset, offset + capacity)
      if (indicators) {
        visible.unshift(gray(offset ? '│ ↑ 上方还有选项' : '│ 已到列表顶部'))
        visible.push(gray(offset + capacity < entries.length ? '│ ↓ 下方还有选项' : '│ 已到列表底部'))
      }
      const position = overflow && choices ? ` [${index + 1}/${choices.length}]` : ''
      lines = [`${cyan('◆')} ${title}`, ...visible, ...hints, `${gray('└')} ${message ? red(message) : gray(`${position} ${tip}`.trim())}`]
    }

    rows = lines.length
    output.write(`${lines.map(line => fitLine(line, columns)).join('\n')}\n`)
  }

  return new Promise((resolve, reject) => {
    // 还原终端状态并移除监听，任何结束路径都必须调用
    function cleanup() {
      input.removeListener('keypress', onKey)
      input.removeListener('end', onEnd)
      input.removeListener('error', onError)
      output.removeListener('resize', onResize)
      input.setRawMode(Boolean(wasRaw))
      input.pause()
      output.write('\x1B[?25h')
    }
    function onEnd() {
      clearFrame()
      cleanup()
      reject(new Cancelled('已取消'))
    }
    function onError(error) {
      cleanup()
      reject(error)
    }
    function onResize() {
      draw(true)
    }

    // 按键处理：取消、确认、上下移动、空格勾选、文本输入
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
        const answer = choices
          ? choices.filter(choice => multiple ? checked.has(choice.value) : choice.value === result).map(choice => choice.label).join('、') || '未选择'
          : result
        clearFrame()
        output.write(`${fitLine(`${green('✓')} ${title}：${answer}`, columns)}\n`)
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
    output.on('resize', onResize)
    output.write('\x1B[?25l')
    draw()
  })
}

// ---------------------------------------------------------------------------

export async function collectOptions(previous = {}, ask = prompt) {
  const options = normalizeOptions(previous)
  options.location = await ask({ title: '项目创建位置', initial: options.location === '.' ? '' : options.location, defaultValue: '.', hint: '输入 my-vue-app：新建项目文件夹；输入 .：在当前目录创建；支持相对或绝对路径' }) || '.'
  const type = await ask({ title: '选择项目类型（单选）', choices: Object.entries(projectTypes).map(([value, project]) => ({ value, label: project.label })), initial: options.type })
  if (type !== options.type)
    options.ui = projectTypes[type].defaultUi
  options.type = type
  options.ui = await ask({ title: '选择 UI 组件库（单选）', choices: projectTypes[type].ui.map(value => ({ value, label: uiLibraries[value].label })), initial: options.ui, hint: '↑↓ 选择一个组件库，Enter 确认' })
  options.http = await ask({ title: '选择 HTTP 请求库（单选）', choices: Object.entries(httpLibraries).map(([value, library]) => ({ value, label: library.label })), initial: options.http })
  options.features = await ask({ title: '选择可选功能', multiple: true, choices: Object.entries(featureLabels).map(([value, label]) => ({ value, label })), initial: options.features, hint: 'Space 勾选，Enter 确认；可全部不选或全部选择' })
  options.install = await ask({ title: '是否立即安装依赖？', choices: [{ value: false, label: '暂不安装' }, { value: true, label: '立即安装' }], initial: options.install })
  console.log(summary(options))
  const action = await ask({ title: '确认配置', choices: [{ value: 'create', label: '开始创建' }, { value: 'edit', label: '返回修改' }, { value: 'cancel', label: '取消' }] })
  if (action === 'edit')
    return collectOptions(options, ask)
  return action === 'create' ? normalizeOptions(options) : null
}
export function summary(options) {
  return [`创建位置：${path.resolve(options.location)}`, `项目类型：${projectTypes[options.type].label}`, `UI 组件库：${uiLibraries[options.ui].label}`, `HTTP 请求库：${httpLibraries[options.http].label}`, `可选功能：${options.features.map(f => featureLabels[f]).join('、') || '无'}`, `安装依赖：${options.install ? '立即安装' : '暂不安装'}`].join('\n')
}
