import type { DefaultTheme } from 'vitepress'

/**
 * 全局搜索配置 (基于 VitePress 内置 MiniSearch 引擎)
 */
export const searchConfig: DefaultTheme.Config['search'] = {
  provider: 'local',

  options: {
    // ==================== 1. 本地搜索引擎高级参数优化 ====================
    miniSearch: {
      /** 
       * 索引构建阶段选项 (仅支持 extractField, tokenize, processTerm)
       */
      options: {
        /**
         * 中文分词适配：解决 MiniSearch 无法对无空格中文切词的问题
         * 修复：调整了正则中 '-' 的位置，避免范围解析错误
         */
        tokenize: (term) => 
          term
            .split(/[-_ \t\n\r,./\\+=="'`:;!?()（）〔〕【】《》]+/)
            .flatMap(word => word.split(/(?<=[\u4e00-\u9fa5])|(?=[\u4e00-\u9fa5])/))
            .filter(Boolean),
      },

      /**
       * 检索匹配阶段选项 (匹配规则、权重与模糊度放在这里)
       */
      searchOptions: {
        // 允许前缀匹配（如输入 "vite" 匹配 "vitepress"）
        prefix: true,
        // 模糊搜索容错度（0~1）
        fuzzy: 0.2,
        // 权重配置：标题 > 标题层级 > 文本正文
        boost: { title: 4, heading: 2, text: 1 },
      }
    },

    // ==================== 2. UI 本地化文案 (中文适配) ====================
    locales: {
      root: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            displayDetails: '显示详细列表',
            backButtonTitle: '清除搜索',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    }
  }
}

// ============================ 以下的未使用 ============================
// 搜索框
const searchOptions: DefaultTheme.AlgoliaSearchOptions = {
    placeholder: '搜索文档',
    translations: {
        button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档',
        },
        modal: {
            searchBox: {
                resetButtonTitle: '清除查询条件',
                resetButtonAriaLabel: '清除查询条件',
                cancelButtonText: '取消',
                cancelButtonAriaLabel: '取消',
            },
            startScreen: {
                recentSearchesTitle: '搜索历史',
                noRecentSearchesText: '没有搜索历史',
                saveRecentSearchButtonTitle: '保存至搜索历史',
                removeRecentSearchButtonTitle: '从搜索历史中移除',
                favoriteSearchesTitle: '收藏',
                removeFavoriteSearchButtonTitle: '从收藏中移除',
            },
            errorScreen: {
                titleText: '无法获取结果',
                helpText: '你可能需要检查你的网络连接',
            },
            footer: {
                selectText: '选择',
                navigateText: '切换',
                closeText: '关闭',
                searchByText: '搜索供应商',
            },
            noResultsScreen: {
                noResultsText: '无法找到相关结果',
                suggestedQueryText: '你可以尝试查询',
                reportMissingResultsText: '你认为该查询应该有结果？',
                reportMissingResultsLinkText: '点击反馈',
            },
        },
    },
}

// 设置搜索框的样式（简易版）
const search1 = {
    provider: "local",
    options: {
        translations: {
            button: {
                buttonText: "搜索文档",
                buttonAriaLabel: "搜索文档",
            },
            modal: {
                noResultsText: "无法找到相关结果",
                resetButtonTitle: "清除查询条件",
                footer: {
                    selectText: "选择",
                    navigateText: "切换",
                },
            },
        },
    },
}