import { localesConfig } from './menu/index.ts'

// 单语言：直接使用根配置，不注册语言切换器。
const { label: _label, link: _link, ...config } = localesConfig.root!
export const languageConfig = config
