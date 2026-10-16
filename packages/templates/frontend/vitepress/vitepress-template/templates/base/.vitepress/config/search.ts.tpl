import type { DefaultTheme } from 'vitepress'
import type { Language, SearchText } from '#config/menu/types'
import { languages } from '#config/menu/registry'
__SEARCH_IMPORTS__

// 搜索只加载自己的文案，避免依赖完整菜单组装。
const translations = __SEARCH_TEXTS__ satisfies Record<Language, SearchText>

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
__SEARCH_OPTIONS__
  },
} satisfies DefaultTheme.Config['search']
