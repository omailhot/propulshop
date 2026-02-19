<template>
  <ShadCardDescription v-bind="$attrs">
    <slot />
  </ShadCardDescription>
</template>

<script setup lang="ts">
import { CardDescription as ShadCardDescription } from "@/components/ui/card";
</script>
