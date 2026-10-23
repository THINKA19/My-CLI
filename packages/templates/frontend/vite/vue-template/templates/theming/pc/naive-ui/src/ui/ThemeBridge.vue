<script setup lang="ts">
import { NConfigProvider, darkTheme } from 'naive-ui'
import { useTheme } from '@/features/theme/setup'
const { isDark, brandColor } = useTheme()
</script>
<template><NConfigProvider :theme="isDark ? darkTheme : null" :theme-overrides="{ common: { primaryColor: brandColor, primaryColorHover: brandColor, primaryColorPressed: brandColor } }"><slot /></NConfigProvider></template>
