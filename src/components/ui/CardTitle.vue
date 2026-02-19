<template>
  <div :class="cn('leading-none font-semibold', $attrs.class as string)">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from "@/lib/utils";
</script>
