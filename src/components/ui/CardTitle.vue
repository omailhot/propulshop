<template>
  <ShadCardTitle v-bind="$attrs">
    <slot />
  </ShadCardTitle>
</template>

<script setup lang="ts">
import { CardTitle as ShadCardTitle } from "@/components/ui/card";
</script>
