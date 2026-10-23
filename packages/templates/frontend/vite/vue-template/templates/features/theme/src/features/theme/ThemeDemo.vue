<script setup lang="ts">
import { useTheme } from './setup'
const { preference, brandColor } = useTheme()
</script>
<template>
  <section class="starter"><h2>主题配置</h2><label>外观 <select v-model="preference" aria-label="外观"><option value="system">跟随系统</option><option value="light">浅色</option><option value="dark">深色</option></select></label><label>品牌色 <input v-model="brandColor" type="color" aria-label="品牌色" /></label></section>
</template>
