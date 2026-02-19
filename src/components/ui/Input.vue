<template>
  <ShadInput
    :model-value="modelValue"
    v-bind="$attrs"
    @update:model-value="
      (value) => emit('update:modelValue', value == null ? '' : String(value))
    "
  />
</template>

<script setup lang="ts">
import { Input as ShadInput } from "@/components/ui/input";

defineProps<{
  modelValue?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

</script>
