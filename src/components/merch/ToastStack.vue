<template>
  <div class="pointer-events-none fixed right-4 bottom-20 z-[60] flex w-[min(26rem,92vw)] flex-col gap-2">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="pointer-events-auto flex items-center gap-2 rounded-lg border bg-background px-3 py-2 shadow-md"
    >
      <CheckCircle2 class="size-4 text-primary" />
      <p class="text-sm">{{ toast.message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2 } from 'lucide-vue-next'

defineProps<{
  toasts: Array<{ id: string; message: string }>
}>()
</script>