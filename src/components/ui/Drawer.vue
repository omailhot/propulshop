<template>
  <teleport to="body">
    <div
      :class="cn('fixed inset-0 z-50 transition', open ? 'pointer-events-auto' : 'pointer-events-none')"
    >
      <button
        type="button"
        :aria-label="title"
        :class="cn('absolute inset-0 bg-black/45 transition-opacity', open ? 'opacity-100' : 'opacity-0')"
        @click="$emit('close')"
      />
      <section
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        :class="cn('absolute inset-x-0 bottom-0 max-h-[86vh] rounded-t-2xl border-t bg-background p-4 shadow-2xl transition-transform sm:p-6', open ? 'translate-y-0' : 'translate-y-full')"
      >
        <slot />
      </section>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  open: boolean
  title: string
}>()

defineEmits<{
  close: []
}>()
</script>