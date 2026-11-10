<template>
  <p
    v-if="chips.length > 0"
    class="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs"
  >
    <span
      v-for="chip in chips"
      :key="chip.key"
      class="inline-flex items-center gap-1.5"
    >
      <span
        v-if="chip.swatchHex"
        class="inline-block size-2.5 shrink-0 rounded-full border border-[rgb(38_32_26_/_0.22)]"
        :style="{ backgroundColor: chip.swatchHex }"
        aria-hidden="true"
      />
      <span>{{ chip.group }}: {{ chip.label }}</span>
    </span>
  </p>
  <p v-else-if="fallback" class="text-muted-foreground mt-0.5 text-xs">
    {{ fallback }}
  </p>
</template>

<script setup lang="ts">
import type { VariantChip } from "@/lib/variant-labels";

defineProps<{
  chips: VariantChip[];
  fallback?: string;
}>();
</script>
