<script setup lang="ts">
import { ref } from 'vue'
import { Button as DemoButton } from '@nutui/nutui'

const count = ref(0)
</script>

<template>
  <main class="starter">
    <h1>NutUI 初始化完成</h1>
    <p>Vue + TypeScript + NutUI</p>
    <DemoButton type="primary" role="button" tabindex="0" @click="count++" @keydown.enter="count++" @keydown.space.prevent="count++">点击体验</DemoButton>
    <p role="status">点击次数：{{ count }}</p>
  </main>
</template>
