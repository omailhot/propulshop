<template>
  <div
    class="border-input bg-card inline-flex items-center gap-0.5 rounded-full border p-1"
  >
    <button
      type="button"
      class="text-foreground hover:bg-accent focus-visible:ring-ring/40 inline-flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-35"
      :disabled="disabled || value <= min"
      aria-label="Diminuer la quantité"
      @click="decrease"
    >
      <Minus class="size-3.5" />
    </button>

    <span class="t-num w-7 text-center text-sm font-semibold">{{ value }}</span>

    <button
      type="button"
      class="text-foreground hover:bg-accent focus-visible:ring-ring/40 inline-flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-35"
      :disabled="disabled || value >= max"
      aria-label="Augmenter la quantité"
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
