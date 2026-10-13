import type { SearchText } from '../../i18n/types'

export const search = {
  button: {
    buttonText: '搜索文档',
    buttonAriaLabel: '搜索文档',
  },
  modal: {
    noResultsText: '无法找到相关结果',
    resetButtonTitle: '清除查询条件',
    displayDetails: '显示详细列表',
    backButtonTitle: '清除搜索',
    footer: {
      selectText: '选择',
      navigateText: '切换',
      closeText: '关闭',
    },
  },
} satisfies SearchText
