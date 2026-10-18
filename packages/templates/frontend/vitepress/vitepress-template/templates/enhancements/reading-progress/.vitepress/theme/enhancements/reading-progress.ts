import { useRoute } from 'vitepress'
import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import '../styles/reading-progress.css'

export function setupReadingProgress() {
  const route = useRoute()
  let bar: HTMLDivElement | undefined
  let observer: ResizeObserver | undefined
  let frame = 0
  function update() {
    frame = 0
    if (!bar)
      return
    const article = document.querySelector<HTMLElement>('.VPDoc .vp-doc')
    bar.hidden = !article
    if (!article)
      return
    const start = article.getBoundingClientRect().top + window.scrollY
    const distance = article.offsetHeight - window.innerHeight
    const progress = distance > 0 ? Math.min(1, Math.max(0, (window.scrollY - start) / distance)) : 1
    bar.style.transform = `scaleX(${progress})`
  }
  function schedule() {
    if (!frame)
      frame = requestAnimationFrame(update)
  }
  async function refresh() {
    await nextTick()
    if (!bar)
      return
    observer?.disconnect()
    const article = document.querySelector('.VPDoc .vp-doc')
    if (article)
      observer?.observe(article)
    schedule()
  }
  onMounted(() => {
    bar = document.createElement('div')
    bar.className = 'reading-progress'
    bar.hidden = true
    bar.setAttribute('aria-hidden', 'true')
    document.body.append(bar)
    observer = new ResizeObserver(schedule)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    void refresh()
  })
  watch(() => route.path, () => { void refresh() })
  onUnmounted(() => {
    observer?.disconnect()
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    cancelAnimationFrame(frame)
    bar?.remove()
    bar = undefined
  })
}
