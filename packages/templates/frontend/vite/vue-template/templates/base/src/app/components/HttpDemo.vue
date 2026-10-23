<script setup lang="ts">
import { ref } from 'vue'
import { getExample } from '@/http/example'

const loading = ref(false)
const message = ref('')
const error = ref('')

async function loadExample() {
  if (loading.value) return
  loading.value = true
  message.value = ''
  error.value = ''
  try {
    const data = await getExample()
    message.value = data.message
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '请求失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="starter" aria-labelledby="http-title">
    <h2 id="http-title">HTTP 请求示例</h2>
    <p>点击按钮，请求本地 Mock JSON 数据。</p>
    <button type="button" :disabled="loading" @click="loadExample">
      {{ loading ? '请求中…' : '请求 Mock 数据' }}
    </button>
    <p v-if="message" role="status">{{ message }}</p>
    <p v-if="error" role="alert">请求失败：{{ error }}</p>
  </section>
</template>
