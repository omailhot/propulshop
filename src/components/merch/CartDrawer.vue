<template>
  <Drawer :open="open" :title="t.cartBuilder" @close="$emit('close')">
    <div class="mx-auto flex max-w-4xl items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold">{{ t.cartBuilder }}</h2>
        <p class="text-xs text-muted-foreground">{{ t.policy }}</p>
      </div>
      <Button variant="ghost" size="icon" @click="$emit('close')">
        <X class="size-4" />
      </Button>
    </div>

    <div class="mx-auto mt-4 grid max-w-4xl gap-5 pb-4 md:grid-cols-[1.45fr_1fr]">
      <div class="max-h-[50vh] space-y-3 overflow-auto pr-1">
        <div v-if="cartLines.length === 0" class="rounded-xl border border-dashed p-6 text-center">
          <ShoppingBasket class="mx-auto mb-2 size-5 text-muted-foreground" />
          <p class="font-medium">{{ t.emptyCart }}</p>
          <p class="text-sm text-muted-foreground">{{ t.addFromCatalog }}</p>
        </div>

        <div v-for="line in cartLines" v-else :key="line.id" class="rounded-xl border p-3">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="font-medium">{{ line.product.name[locale] }}</p>
              <p v-if="getVariantLabels(line).length > 0" class="text-xs text-muted-foreground">
                {{ getVariantLabels(line).join(' | ') }}
              </p>
            </div>
            <p class="font-medium">{{ formatCurrency.format(line.lineTotal) }}</p>
          </div>

          <div class="mt-3 flex items-center justify-between">
            <div class="flex items-center gap-1 rounded-full border bg-background px-1 py-1">
              <Button variant="ghost" size="icon" class="h-7 w-7 rounded-full" @click="$emit('update-item-quantity', line.id, line.quantity - 1)">
                <Minus class="size-3.5" />
              </Button>
              <span class="w-6 text-center text-sm font-medium">{{ line.quantity }}</span>
              <Button variant="ghost" size="icon" class="h-7 w-7 rounded-full" @click="$emit('update-item-quantity', line.id, line.quantity + 1)">
                <Plus class="size-3.5" />
              </Button>
            </div>

            <Button variant="ghost" size="sm" @click="$emit('remove-item', line.id)">{{ t.removeItem }}</Button>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border bg-muted/30 p-4">
        <div class="space-y-2 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">{{ t.subtotal }}</span>
            <span>{{ formatCurrency.format(subtotal) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">{{ t.creditUsed }}</span>
            <span>-{{ formatCurrency.format(creditUsed) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">{{ t.walletToPay }}</span>
            <span class="font-semibold">{{ formatCurrency.format(walletToPay) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">{{ t.creditRemaining }}</span>
            <span>{{ formatCurrency.format(creditRemaining) }}</span>
          </div>
        </div>
        <Button class="mt-4 w-full">
          <CreditCard class="size-4" />
          {{ t.checkout }}
        </Button>
      </div>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { CreditCard, Minus, Plus, ShoppingBasket, X } from 'lucide-vue-next'

import Button from '@/components/ui/Button.vue'
import Drawer from '@/components/ui/Drawer.vue'
import type { MerchCopy } from '@/config/merch-copy'
import type { ProductVariantGroup, StoreLocale } from '@/types/merch'

type CartLine = {
  id: string
  quantity: number
  lineTotal: number
  selectedOptions: Record<string, string>
  product: {
    name: Record<StoreLocale, string>
    variantGroups?: ProductVariantGroup[]
  }
}

const props = defineProps<{
  t: MerchCopy
  locale: StoreLocale
  open: boolean
  cartLines: CartLine[]
  subtotal: number
  creditUsed: number
  creditRemaining: number
  walletToPay: number
  formatCurrency: Intl.NumberFormat
}>()

defineEmits<{
  close: []
  'remove-item': [cartItemId: string]
  'update-item-quantity': [cartItemId: string, nextQuantity: number]
}>()

const getVariantLabels = (line: CartLine) =>
  (line.product.variantGroups ?? [])
    .map((group) => {
      const selectedOption = group.options.find((option) => option.id === line.selectedOptions[group.id])
      if (!selectedOption) {
        return null
      }

      return `${group.label[props.locale]}: ${selectedOption.label[props.locale]}`
    })
    .filter((value): value is string => Boolean(value))
</script>