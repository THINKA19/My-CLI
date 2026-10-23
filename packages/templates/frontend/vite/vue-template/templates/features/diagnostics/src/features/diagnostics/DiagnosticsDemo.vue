<script setup lang="ts">
import { ref } from 'vue'
import { reportError } from './setup'
const message = ref('')
function demonstrate() { message.value = reportError(new Error('Diagnostic sample')).message }
</script>
<template>
  <section class="starter"><h2>错误诊断</h2><button type="button" @click="demonstrate">记录示例诊断</button><p>{{ message }}</p><p>可通过 setDiagnosticReporter 接入团队上报服务；默认仅开发环境输出。</p></section>
</template>
