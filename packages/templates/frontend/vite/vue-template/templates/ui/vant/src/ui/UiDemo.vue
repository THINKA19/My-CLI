<script setup lang="ts">
import { ref } from 'vue'
import { Button as DemoButton } from 'vant'

const count = ref(0)
</script>

<template>
  <main class="starter">
    <h1>Vant 初始化完成</h1>
    <p>Vue + TypeScript + Vant</p>
    <DemoButton type="primary" @click="count++">点击体验</DemoButton>
    <p role="status">点击次数：{{ count }}</p>
  </main>
</template>
