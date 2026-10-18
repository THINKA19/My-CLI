import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import './styles/style.css'
// __ENHANCEMENT_IMPORTS__

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {}),
  setup() {
    // __ENHANCEMENT_SETUP__
  },
} satisfies Theme
