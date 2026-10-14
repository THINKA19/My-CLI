import type { Theme } from 'vitepress'
import mermaid from 'mermaid'
import { useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { h, nextTick, onMounted, watch } from 'vue'

import './styles/style.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  setup() {
    const route = useRoute()
    const pending = new WeakSet<Element>()

    // 初始化 Mermaid
    onMounted(() => {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
      })
      void renderMermaid()
    })

    // 监听路由变化，重新渲染 Mermaid 图表
    watch(
      () => route.path,
      () => nextTick(() => { void renderMermaid() }),
    )

    async function renderMermaid() {
      const mermaidElements = document.querySelectorAll('.mermaid:not([data-processed])')
      if (mermaidElements.length === 0)
        return

      // 顺序渲染，pending 防止重复的路由回调处理同一节点。
      for (const [index, element] of mermaidElements.entries()) {
        if (pending.has(element))
          continue
        const id = `mermaid-${Date.now()}-${index}`
        pending.add(element)

        try {
          // Mermaid 返回 Promise；成功后标记完成，并绑定图表交互事件。
          const { svg, bindFunctions } = await mermaid.render(id, element.textContent || '')
          if (element.isConnected) {
            element.innerHTML = svg
            element.setAttribute('data-processed', 'true')
            bindFunctions?.(element as HTMLElement)
          }
        }
        catch (error) {
          console.error('Mermaid rendering error:', error)
        }
        finally {
          pending.delete(element)
        }
      }
    }
  },
} satisfies Theme
