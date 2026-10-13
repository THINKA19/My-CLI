import type { DefaultTheme } from 'vitepress'
import type { Language, SearchText } from './i18n/types'
import { languages } from './i18n/registry'
import { search as en } from './locales/en/search'
import { search as vi } from './locales/vi/search'
import { search as zh } from './locales/zh/search'

const translations = { zh, en, vi } satisfies Record<Language, SearchText>

export const searchConfig = {
  provider: 'local',
  options: {
    miniSearch: {
      options: {
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
