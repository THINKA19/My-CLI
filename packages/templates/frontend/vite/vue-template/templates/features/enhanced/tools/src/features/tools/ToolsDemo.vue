<script setup lang="ts">
import { useDebouncedRef } from './composables'
const { value, set } = useDebouncedRef()
</script>
<template>
  <section class="starter"><h2>通用工具示例</h2><label>防抖输入 <input aria-label="防抖输入" @input="set(($event.target as HTMLInputElement).value)" /></label><p>200ms 后的值：{{ value }}</p></section>
</template>
