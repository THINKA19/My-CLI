<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t, d, n, locale } = useI18n()
</script>
<template>
  <section class="starter"><h2>{{ t('title') }}</h2><label>{{ t('language') }} <select v-model="locale" aria-label="语言"><option value="zh-CN">简体中文</option><option value="en-US">English</option></select></label><p>{{ t('greeting') }}</p><p>{{ d(new Date('2026-01-01T00:00:00Z'), 'short') }} · {{ n(12345.67, 'decimal') }}</p></section>
</template>
