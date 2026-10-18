import mediumZoom from 'medium-zoom'
import { useRoute } from 'vitepress'
import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import '../styles/image-zoom.css'

export function setupImageZoom() {
  const route = useRoute()
  let zoom: ReturnType<typeof mediumZoom> | undefined
  let mounted = false
  async function refresh() {
    await nextTick()
    if (!mounted)
      return
    zoom?.detach()
    zoom?.attach(document.querySelectorAll('.vp-doc img:not(a img):not([data-no-zoom])'))
  }
  onMounted(() => {
    mounted = true
    zoom = mediumZoom({ background: 'var(--vp-c-bg)', margin: 24 })
    void refresh()
  })
  watch(() => route.path, () => { void refresh() })
  onUnmounted(() => {
    mounted = false
    zoom?.detach()
  })
}
