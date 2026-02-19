<template>
  <div
    class="border-border/70 bg-background/95 mb-2 inline-flex items-center gap-1 overflow-hidden rounded-full border p-1.5 sm:mb-0"
  >
    <button
      type="button"
      class="text-foreground/90 hover:bg-accent/80 inline-flex h-8 w-8 items-center justify-center rounded-full transition disabled:pointer-events-none disabled:opacity-40"
      :disabled="disabled || value <= min"
      @click="decrease"
    >
      <Minus class="size-3.5" />
    </button>

    <span class="w-8 text-center text-sm font-semibold tabular-nums">{{
      value
    }}</span>

    <button
      type="button"
      class="text-foreground/90 hover:bg-accent/80 inline-flex h-8 w-8 items-center justify-center rounded-full transition disabled:pointer-events-none disabled:opacity-40"
      :disabled="disabled || value >= max"
      @click="increase"
    >
      <Plus class="size-3.5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Minus, Plus } from "lucide-vue-next";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: number;
    min?: number;
    max?: number;
    disabled?: boolean;
  }>(),
  {
    min: 1,
    max: 25,
    disabled: false,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

const value = computed(() => {
  if (!Number.isFinite(props.modelValue)) {
    return props.min;
  }
  return Math.min(props.max, Math.max(props.min, Math.round(props.modelValue)));
});

const decrease = () => {
  emit("update:modelValue", Math.max(props.min, value.value - 1));
};

const increase = () => {
  emit("update:modelValue", Math.min(props.max, value.value + 1));
};
</script>
