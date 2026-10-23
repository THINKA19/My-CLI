import { visualizer } from 'rollup-plugin-visualizer'
export function analyzePlugin() {
  return process.env.ANALYZE === 'true' ? visualizer({ filename: 'stats.html', open: false, gzipSize: true, brotliSize: true }) : undefined
}
