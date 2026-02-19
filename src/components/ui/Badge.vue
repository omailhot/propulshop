<template>
  <ShadBadge :variant="variant" v-bind="$attrs">
    <slot />
  </ShadBadge>
</template>

<script setup lang="ts">
import { Badge as ShadBadge } from "@/components/ui/badge/index";
import type { BadgeVariants } from "@/components/ui/badge/index";

withDefaults(
  defineProps<{
    variant?: BadgeVariants["variant"];
  }>(),
  {
    variant: "default",
  },
);
</script>
