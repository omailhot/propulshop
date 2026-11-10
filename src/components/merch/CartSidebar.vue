<template>
  <aside class="xl:sticky xl:top-24 xl:self-start">
    <div class="bg-card rounded-lg border shadow-md">
      <div class="flex items-center justify-between gap-3 px-5 pt-5">
        <h2 class="t-h3 font-semibold">{{ t.cartBuilder }}</h2>
        <Button
          variant="ghost"
          size="sm"
          :disabled="readOnly || cartLines.length === 0"
          @click="$emit('reset-cart')"
        >
          {{ t.resetCart }}
        </Button>
      </div>

      <div class="space-y-4 p-5">
        <div class="cart-scrollbar max-h-[40vh] overflow-auto pr-1">
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
          :t="t"
          :subtotal="subtotal"
          :credit-used="creditUsed"
          :credit-remaining="creditRemaining"
          :wallet-to-pay="walletToPay"
          :format-currency="formatCurrency"
          :is-empty="cartLines.length === 0"
          :read-only="readOnly"
          show-hint
          @continue-checkout="$emit('continue-checkout')"
        />
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import CartLineList from "@/components/merch/CartLineList.vue";
import CartTotals from "@/components/merch/CartTotals.vue";
import Button from "@/components/ui/Button.vue";
import type { MerchCopy } from "@/config/merch-copy";
import type { CartLineView, StoreLocale } from "@/types/merch";

defineProps<{
  t: MerchCopy;
  locale: StoreLocale;
  cartLines: CartLineView[];
  subtotal: number;
  creditUsed: number;
  creditRemaining: number;
  walletToPay: number;
  formatCurrency: Intl.NumberFormat;
  readOnly?: boolean;
}>();

defineEmits<{
  "reset-cart": [];
  "remove-item": [cartItemId: string];
  "update-item-quantity": [cartItemId: string, nextQuantity: number];
  "continue-checkout": [];
}>();
</script>
