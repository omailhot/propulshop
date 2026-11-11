<template>
  <div
    role="radiogroup"
    :aria-label="label"
    :class="['flex flex-wrap items-center', size === 'sm' ? 'gap-2.5' : 'gap-3']"
  >
    <button
      v-for="option in options"
      :key="option.id"
      type="button"
      role="radio"
      :aria-checked="option.id === modelValue"
      :aria-label="option.label"
      :title="option.label"
      :disabled="disabled"
      :class="[
        'relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full transition-shadow outline-none disabled:cursor-not-allowed disabled:opacity-50',
        'ring-offset-background ring-offset-2 focus-visible:ring-[3px]',
        size === 'sm' ? 'size-6' : 'size-8',
        option.id === modelValue
          ? 'ring-foreground ring-2'
          : 'hover:ring-input focus-visible:ring-ring/50 hover:ring-2',
      ]"
      @click.stop="select(option.id)"
      @keydown.enter.stop
      @keydown.space.stop
    >
      <!-- Le filet garde lisibles les teintes pâles sur une carte blanche. -->
      <span
        class="block size-full rounded-full border border-[rgb(38_32_26_/_0.22)]"
        :style="{ backgroundColor: option.hex }"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * Pastilles de couleur: un groupe radio où chaque choix est une teinte.
 * La couleur n'est jamais le seul repère: chaque pastille porte son nom
 * (aria-label, infobulle), et l'appelant affiche le nom du choix actif.
 */
export type ColorSwatchOption = {
  id: string;
  label: string;
  hex: string;
};

withDefaults(
  defineProps<{
    modelValue: string | null | undefined;
    options: ColorSwatchOption[];
    label: string;
    size?: "sm" | "md";
    disabled?: boolean;
  }>(),
  { size: "md", disabled: false },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const select = (optionId: string) => {
  emit("update:modelValue", optionId);
};
</script>
