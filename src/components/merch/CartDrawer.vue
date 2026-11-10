<template>
  <Drawer :open="open" :title="t.cartBuilder" @close="$emit('close')">
    <div
      class="mx-auto flex max-h-[calc(86dvh-4.5rem)] w-full max-w-6xl flex-col pb-2 md:max-h-none"
    >
      <div class="flex items-center justify-between gap-3">
        <h2 class="t-h3 font-semibold">{{ t.cartBuilder }}</h2>
        <div class="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            :disabled="readOnly || cartLines.length === 0"
            @click="$emit('reset-cart')"
          >
            {{ t.resetCart }}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            :aria-label="t.closeCart"
            @click="$emit('close')"
          >
            <X class="size-4" />
          </Button>
        </div>
      </div>
      <p class="text-muted-foreground mt-1 text-xs">{{ t.policy }}</p>

      <div
        class="mt-4 flex min-h-0 flex-1 flex-col gap-5 md:grid md:grid-cols-[1.45fr_1fr]"
      >
        <div
          class="cart-scrollbar min-h-0 flex-1 overflow-y-auto pr-1 md:max-h-[50vh] md:flex-none"
        >
          <CartLineList
            :t="t"
            :locale="locale"
            :cart-lines="cartLines"
            :format-currency="formatCurrency"
            :read-only="readOnly"
            @remove-item="(id) => $emit('remove-item', id)"
            @update-item-quantity="
              (id, quantity) => $emit('update-item-quantity', id, quantity)
            "
          />
        </div>

        <CartTotals
          class="shrink-0 self-start md:w-full"
          :t="t"
          :subtotal="subtotal"
          :credit-used="creditUsed"
          :credit-remaining="creditRemaining"
          :wallet-to-pay="walletToPay"
          :format-currency="formatCurrency"
          :is-empty="cartLines.length === 0"
          :read-only="readOnly"
          @continue-checkout="$emit('continue-checkout')"
        />
      </div>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { X } from "lucide-vue-next";

import CartLineList from "@/components/merch/CartLineList.vue";
import CartTotals from "@/components/merch/CartTotals.vue";
import Button from "@/components/ui/Button.vue";
import Drawer from "@/components/ui/Drawer.vue";
import type { MerchCopy } from "@/config/merch-copy";
import type { CartLineView, StoreLocale } from "@/types/merch";

defineProps<{
  t: MerchCopy;
  locale: StoreLocale;
  open: boolean;
  cartLines: CartLineView[];
  subtotal: number;
  creditUsed: number;
  creditRemaining: number;
  walletToPay: number;
  formatCurrency: Intl.NumberFormat;
  readOnly?: boolean;
}>();

defineEmits<{
  close: [];
  "reset-cart": [];
  "remove-item": [cartItemId: string];
  "update-item-quantity": [cartItemId: string, nextQuantity: number];
  "continue-checkout": [];
}>();
</script>
