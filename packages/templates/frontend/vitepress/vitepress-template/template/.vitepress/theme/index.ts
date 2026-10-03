// https://vitepress.dev/guide/custom-theme
import { h, onMounted, watch, nextTick } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { useRoute } from 'vitepress'
import './styles/style.css'

// 导入 Mermaid
import mermaid from 'mermaid'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    // ...
  },
  setup() {
    const route = useRoute()
    
    // 初始化 Mermaid
    onMounted(() => {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
      })
      renderMermaid()
    })
    
    // 监听路由变化，重新渲染 Mermaid 图表
    watch(
      () => route.path,
      () => nextTick(() => renderMermaid())
    )
    
    function renderMermaid() {
      const mermaidElements = document.querySelectorAll('.mermaid:not([data-processed])')
      if (mermaidElements.length === 0) return
      
      mermaidElements.forEach((element, index) => {
        const id = `mermaid-${Date.now()}-${index}`
        element.setAttribute('data-processed', id)
        
        try {
          mermaid.render(id, element.textContent || '', (svgCode) => {
            element.innerHTML = svgCode
          })
        } catch (error) {
          console.error('Mermaid rendering error:', error)
        }
      })
    }
  }
} satisfies Theme
