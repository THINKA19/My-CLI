import type { MenuText } from '#config/i18n/types'
import type { gettingStartedNav } from '#config/nav/getting-started'

export const gettingStarted = {
  'nav.getting-started': '入门',
  'nav.getting-started.1': '安装',
  'nav.getting-started.2': '环境',
  'nav.getting-started.3': '目录',
  'nav.getting-started.4': '命令',
  'nav.getting-started.5': '配置',
} satisfies MenuText<readonly [typeof gettingStartedNav]>
