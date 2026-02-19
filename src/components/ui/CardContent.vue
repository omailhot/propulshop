<template>
  <ShadCardContent v-bind="$attrs">
    <slot />
  </ShadCardContent>
</template>

<script setup lang="ts">
import { CardContent as ShadCardContent } from "@/components/ui/card";
</script>
