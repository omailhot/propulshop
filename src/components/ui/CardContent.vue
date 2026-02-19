<template>
  <div :class="cn('px-6', $attrs.class as string)">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from "@/lib/utils";
</script>
