<script setup lang="ts">
import { ConfigProvider, theme } from 'ant-design-vue'
import { useTheme } from '@/features/theme/setup'
const { isDark, brandColor } = useTheme()
</script>
<template><ConfigProvider :theme="{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm, token: { colorPrimary: brandColor } }"><slot /></ConfigProvider></template>
