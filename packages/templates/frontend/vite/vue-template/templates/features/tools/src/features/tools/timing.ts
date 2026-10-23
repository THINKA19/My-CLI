export function debounce<Args extends unknown[]>(callback: (...args: Args) => void, delay = 200) {
  let timer: ReturnType<typeof setTimeout> | undefined
  const cancel = () => { clearTimeout(timer); timer = undefined }
  const run = (...args: Args) => { cancel(); timer = setTimeout(() => { timer = undefined; callback(...args) }, delay) }
  return Object.assign(run, { cancel })
}
// Leading throttle: the first call in each time window runs immediately.
export function throttle<Args extends unknown[]>(callback: (...args: Args) => void, delay = 200) {
  let last = -Infinity
  return (...args: Args) => {
    const now = Date.now()
    if (now - last >= delay) { last = now; callback(...args) }
  }
}
