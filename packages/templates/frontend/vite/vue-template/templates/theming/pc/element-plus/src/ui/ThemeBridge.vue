<script setup lang="ts">
import 'element-plus/theme-chalk/dark/css-vars.css'
import { useTheme } from '@/features/theme/setup'
const { brandColor } = useTheme()
</script>
<template><div :style="{ '--el-color-primary': brandColor }"><slot /></div></template>
