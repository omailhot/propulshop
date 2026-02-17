<template>
  <footer class="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur">
    <div class="mx-auto max-w-7xl px-4 py-3 sm:px-6">
      <Button class="w-full justify-between" @click="$emit('open')">
        <span class="inline-flex items-center gap-2">
          <PanelBottomOpen class="size-4" />
          {{ t.cartBuilder }}
        </span>
        <span class="text-xs font-semibold sm:text-sm">{{ itemCount }} {{ t.items }} | {{ formatCurrency.format(subtotal) }}</span>
      </Button>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { PanelBottomOpen } from 'lucide-vue-next'

import Button from '@/components/ui/Button.vue'
import type { MerchCopy } from '@/config/merch-copy'

defineProps<{
  t: MerchCopy
  itemCount: number
  subtotal: number
  formatCurrency: Intl.NumberFormat
}>()

defineEmits<{
  open: []
}>()
</script>