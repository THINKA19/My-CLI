<script setup lang="ts">
import { useData } from 'vitepress'
import { onMounted } from 'vue'
import { languages } from '../../config/i18n/registry'

const { site } = useData()
const language = Object.values(languages).find(locale => locale.configKey === 'root')!
const target = site.value.base + language.prefix.slice(1)
onMounted(() => window.location.replace(target))
</script>

<template>
  <p><a :href="target">进入文档 / Open documentation / Mở tài liệu</a></p>
</template>
