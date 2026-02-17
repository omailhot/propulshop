<template>
  <span :class="badgeVariants({ variant })" v-bind="$attrs">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { badgeVariants, type BadgeVariant } from '@/components/ui/badge'

withDefaults(
  defineProps<{
    variant?: BadgeVariant
  }>(),
  {
    variant: 'default',
  },
)
</script>