import type { DefaultTheme } from 'vitepress'
import type { Language, SearchText } from '#config/i18n/types'
import { languages } from '#config/i18n/registry'
import { search as en } from '#config/locales/en/search'
import { search as vi } from '#config/locales/vi/search'
import { search as zh } from '#config/locales/zh/search'

// 搜索只加载自己的文案，避免依赖完整菜单组装。
const translations = { zh, en, vi } satisfies Record<Language, SearchText>

export const searchConfig = {
  provider: 'local',
  options: {
    miniSearch: {
      options: {
        // 拉丁文字按分隔符切词，中文按单字切分，兼顾当前三种语言。
        tokenize: (term: string) => term
          .split(/[-_ \t\n\r,./\\+="'`:;!?()（）〔〕【】《》]+/)
          .flatMap(word => word.split(/(?<=[\u4E00-\u9FA5])|(?=[\u4E00-\u9FA5])/))
          .filter(Boolean),
      },
      searchOptions: {
        prefix: true,
        fuzzy: 0.2,
        boost: { title: 4, heading: 2, text: 1 },
      },
    },
    locales: Object.fromEntries(Object.entries(languages).map(([code, locale]) => [
      locale.configKey,
      { translations: translations[code as Language] },
    ])),
  },
} satisfies DefaultTheme.Config['search']
