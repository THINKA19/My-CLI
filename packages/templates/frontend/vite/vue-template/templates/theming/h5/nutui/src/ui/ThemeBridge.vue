<script setup lang="ts">
import { useTheme } from '@/features/theme/setup'
const { brandColor, isDark } = useTheme()
</script>
<template><div :class="{ 'nut-theme-dark': isDark }" :style="{ '--nut-primary-color': brandColor, '--nut-primary-color-end': brandColor }"><slot /></div></template>
