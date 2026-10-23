<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { createExampleRequest } from '@/http/example'
import { toHttpError } from '@/http/errors'

const loading = ref(false)
const message = ref('')
const error = ref('')
let active: ReturnType<typeof createExampleRequest> | undefined
let disposed = false

async function loadExample() {
  if (loading.value) return
  loading.value = true
  message.value = ''
  error.value = ''
  active = createExampleRequest()
  try {
    const data = await active.send()
    if (!disposed) message.value = data.message
  } catch (cause) {
    const failure = toHttpError(cause)
    if (!disposed && failure.kind !== 'cancelled') error.value = failure.message
  } finally {
    if (!disposed) loading.value = false
    active = undefined
  }
}
onBeforeUnmount(() => { disposed = true; active?.cancel() })
</script>

<template>
  <section class="starter" aria-labelledby="http-title">
    <h2 id="http-title">HTTP 请求示例</h2>
    <p>点击按钮，请求本地 Mock JSON 数据。</p>
    <button type="button" :disabled="loading" @click="loadExample">{{ loading ? '请求中…' : '请求 Mock 数据' }}</button>
    <button v-if="loading" type="button" @click="active?.cancel()">取消请求</button>
    <p v-if="message" role="status">{{ message }}</p>
    <p v-if="error" role="alert">请求失败：{{ error }}</p>
  </section>
</template>
