<template>
  <ShadCard v-bind="$attrs">
    <slot />
  </ShadCard>
</template>

<script setup lang="ts">
import { Card as ShadCard } from "@/components/ui/card";
</script>
