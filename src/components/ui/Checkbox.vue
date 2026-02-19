<template>
  <ShadCheckbox
    :model-value="modelValue"
    v-bind="$attrs"
    @update:model-value="emit('update:modelValue', Boolean($event))"
  />
</template>

<script setup lang="ts">
import { Checkbox as ShadCheckbox } from "@/components/ui/checkbox";

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();
</script>
