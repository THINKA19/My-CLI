import type { ThemeText } from '#config/menu/types'

export const themeConfig = {
  siteTitle: 'Custom Navigation Title',
  outline: {
    label: 'On this page',
  },
  footer: {
    message: 'Released under the MIT License',
    copyright: 'Copyright © 2024-present Your Name',
  },
  editLink: {
    text: 'Edit this page on GitHub',
  },
  lastUpdated: {
    text: 'Last updated',
  },
  docFooter: {
    prev: 'Previous',
    next: 'Next',
  },
  darkModeSwitchLabel: 'Appearance',
  lightModeSwitchTitle: 'Switch to light mode',
  darkModeSwitchTitle: 'Switch to dark mode',
  sidebarMenuLabel: 'Menu',
  returnToTopLabel: 'Return to top',
  langMenuLabel: 'Language',
  notFound: {
    title: 'Page Not Found',
    quote: 'It seems you have arrived in an unknown wilderness...',
    linkLabel: 'Go to home',
    linkText: 'Take me home',
  },
} satisfies ThemeText
