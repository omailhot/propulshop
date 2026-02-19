<template>
  <div :class="cn('text-muted-foreground text-sm', $attrs.class as string)">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from "@/lib/utils";
</script>
