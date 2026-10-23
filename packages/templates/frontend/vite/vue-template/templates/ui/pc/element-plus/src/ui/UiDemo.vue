<script setup lang="ts">
import { ref } from 'vue'
import { ElButton as DemoButton } from 'element-plus'

const count = ref(0)
</script>

<template>
  <main class="starter">
    <h1>Element Plus 初始化完成</h1>
    <p>Vue + TypeScript + Element Plus</p>
    <DemoButton type="primary" @click="count++">点击体验</DemoButton>
    <p role="status">点击次数：{{ count }}</p>
  </main>
</template>
