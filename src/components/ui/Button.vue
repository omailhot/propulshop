<template>
  <button
    :type="resolvedType"
    :class="buttonVariants({ variant, size })"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

import {
  type ButtonSize,
  type ButtonVariant,
  buttonVariants,
} from "@/components/ui/button";

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    type?: "button" | "submit" | "reset";
  }>(),
  {
    variant: "default",
    size: "default",
  },
);

const resolvedType = computed(() => props.type ?? "button");
</script>
