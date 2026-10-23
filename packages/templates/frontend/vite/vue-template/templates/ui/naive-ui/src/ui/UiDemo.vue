<script setup lang="ts">
import { ref } from 'vue'
import { NButton as DemoButton } from 'naive-ui'

const count = ref(0)
</script>

<template>
  <main class="starter">
    <h1>Naive UI 初始化完成</h1>
    <p>Vue + TypeScript + Naive UI</p>
    <DemoButton type="primary" @click="count++">点击体验</DemoButton>
    <p role="status">点击次数：{{ count }}</p>
  </main>
</template>
