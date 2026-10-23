<script setup lang="ts">
import { ConfigProvider } from 'vant'
import { useTheme } from '@/features/theme/setup'
const { isDark, brandColor } = useTheme()
</script>
<template><ConfigProvider :theme="isDark ? 'dark' : 'light'" :theme-vars="{ primaryColor: brandColor }"><slot /></ConfigProvider></template>
