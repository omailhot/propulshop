<template>
  <!--
    La jauge du crédit. C'est une donnée: aplat orange sur piste neutre,
    sans grain ni dégradé, et la valeur est toujours écrite à côté.
  -->
  <div>
    <div class="flex items-baseline justify-between gap-3 text-xs">
      <span class="text-muted-foreground">{{ label }}</span>
      <span class="t-num text-foreground font-semibold">
        {{ formatCurrency.format(creditUsed) }}
        <span class="text-muted-foreground font-normal">
          / {{ formatCurrency.format(creditTotal) }}
        </span>
      </span>
    </div>
    <div
      class="bg-secondary mt-1.5 h-2 overflow-hidden rounded-full"
      role="progressbar"
      :aria-label="label"
      aria-valuemin="0"
      :aria-valuemax="creditTotal"
      :aria-valuenow="creditUsed"
    >
      <div
        class="bg-orange h-full rounded-full transition-[width] duration-300"
        :style="{ width: `${percent}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  label: string;
  creditUsed: number;
  creditTotal: number;
  formatCurrency: Intl.NumberFormat;
}>();

const percent = computed(() => {
  if (props.creditTotal <= 0) {
    return 0;
  }
  return Math.min(
    100,
    Math.max(0, (props.creditUsed / props.creditTotal) * 100),
  );
});
</script>
