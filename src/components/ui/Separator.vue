<template>
  <ShadSeparator :orientation="props.orientation" v-bind="$attrs" />
</template>

<script setup lang="ts">
import { Separator as ShadSeparator } from "@/components/ui/separator";

const props = withDefaults(
  defineProps<{
    orientation?: "horizontal" | "vertical";
  }>(),
  {
    orientation: "horizontal",
  },
);
</script>
