<template>
  <div
    role="radiogroup"
    :aria-label="label"
    class="bg-secondary inline-flex flex-wrap gap-1 rounded-md p-1"
  >
    <button
      v-for="option in options"
      :key="option.id"
      type="button"
      role="radio"
      :aria-checked="modelValue === option.id"
      :class="[
        'focus-visible:ring-ring/40 inline-flex cursor-pointer items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-xs font-semibold transition-colors outline-none focus-visible:ring-[3px]',
        modelValue === option.id
          ? 'bg-card text-foreground shadow-xs'
          : 'text-muted-foreground hover:text-foreground',
      ]"
      @click="$emit('update:modelValue', option.id)"
    >
      <span
        v-if="option.dot"
        class="size-2 rounded-full"
        :style="{ backgroundColor: option.dot }"
        aria-hidden="true"
      />
      {{ option.label }}
      <span
        v-if="option.count !== undefined"
        class="t-num text-muted-foreground font-normal"
      >
        {{ option.count }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number">
defineProps<{
  label: string;
  options: Array<{ id: T; label: string; count?: number; dot?: string | null }>;
  modelValue: T;
}>();

defineEmits<{
  "update:modelValue": [value: T];
}>();
</script>
