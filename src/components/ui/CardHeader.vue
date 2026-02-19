<template>
  <ShadCardHeader v-bind="$attrs">
    <slot />
  </ShadCardHeader>
</template>

<script setup lang="ts">
import { CardHeader as ShadCardHeader } from "@/components/ui/card";
</script>
