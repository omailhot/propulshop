<template>
  <span :class="badgeVariants({ variant })" v-bind="$attrs">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { type BadgeVariant, badgeVariants } from "@/components/ui/badge";

withDefaults(
  defineProps<{
    variant?: BadgeVariant;
  }>(),
  {
    variant: "default",
  },
);
</script>
