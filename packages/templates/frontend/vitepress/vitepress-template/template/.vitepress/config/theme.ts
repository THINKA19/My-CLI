import type { DefaultTheme } from 'vitepress'

// 语言无关的设置只维护一份。
export const themeConfig = {
  logo: '/logo.svg',
  outline: { level: [2, 5] },
  socialLinks: [
    { icon: 'github', link: 'https://github.com/your-username/your-repo' },
  ],
  editLink: { pattern: 'https://github.com/your-username/your-repo/edit/main/src/:path' },
  lastUpdated: { formatOptions: { dateStyle: 'short', timeStyle: 'medium' } },
  externalLinkIcon: true,
} satisfies DefaultTheme.Config
