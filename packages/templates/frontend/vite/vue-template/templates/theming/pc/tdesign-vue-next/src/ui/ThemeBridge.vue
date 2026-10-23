<script setup lang="ts">
import { useTheme } from '@/features/theme/setup'
const { brandColor } = useTheme()
</script>
<template><div :style="{ '--td-brand-color': brandColor }"><slot /></div></template>
