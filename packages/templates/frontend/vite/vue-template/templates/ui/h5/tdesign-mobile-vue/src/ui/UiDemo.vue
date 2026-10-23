<script setup lang="ts">
import { ref } from 'vue'
import { Button as DemoButton } from 'tdesign-mobile-vue'

const count = ref(0)
</script>

<template>
  <main class="starter">
    <h1>TDesign Mobile Vue 初始化完成</h1>
    <p>Vue + TypeScript + TDesign Mobile Vue</p>
    <DemoButton theme="primary" @click="count++">点击体验</DemoButton>
    <p role="status">点击次数：{{ count }}</p>
  </main>
</template>
