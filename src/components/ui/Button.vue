<template>
  <ShadButton
    :variant="variant"
    :size="size"
    :type="resolvedType"
    v-bind="$attrs"
  >
    <slot />
  </ShadButton>
</template>

<script setup lang="ts">
import { computed } from "vue";

import { Button as ShadButton } from "@/components/ui/button/index";
import type { ButtonVariants } from "@/components/ui/button/index";

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariants["variant"];
    size?: ButtonVariants["size"];
    type?: "button" | "submit" | "reset";
  }>(),
  {
    variant: "default",
    size: "default",
  },
);

const resolvedType = computed(() => props.type ?? "button");
</script>
