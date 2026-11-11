<template>
  <!--
    Le panier vit dans un tiroir latéral: en-tête fixe, lignes défilantes,
    totaux et action épinglés en bas. Le catalogue garde toute la largeur.
  -->
  <Drawer
    :open="open"
    :title="t.cartBuilder"
    direction="right"
    @close="$emit('close')"
  >
    <div class="flex items-center justify-between gap-3 px-6 pt-6 pb-2">
      <div class="flex items-baseline gap-2">
        <h2 class="t-h3 font-semibold">{{ t.cartBuilder }}</h2>
        <span class="text-muted-foreground t-num text-sm">
          {{ itemCount }} {{ t.items }}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        :aria-label="t.closeCart"
        @click="$emit('close')"
      >
        <X class="size-4" />
      </Button>
    </div>

    <div class="cart-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-4">
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
      <div v-if="cartLines.length > 0" class="border-t pt-4">
        <button
          type="button"
          class="text-foreground hover:bg-encre/8 focus-visible:ring-ring/40 -ml-3 inline-flex h-9 cursor-pointer items-center rounded-md px-3 text-sm transition-colors outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
          :disabled="readOnly"
          @click="$emit('reset-cart')"
        >
          {{ t.resetCart }}
        </button>
      </div>
    </div>

    <div
      class="border-t px-6 pt-5"
      style="padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 1rem)"
    >
      <CartTotals
        flat
        :t="t"
        :subtotal="subtotal"
        :credit-used="creditUsed"
        :credit-remaining="creditRemaining"
        :wallet-to-pay="walletToPay"
        :credit-total="creditTotal"
        :credit-known="creditKnown"
        :format-currency="formatCurrency"
        :is-empty="cartLines.length === 0"
        :read-only="readOnly"
        @continue-checkout="$emit('continue-checkout')"
      />
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { X } from "lucide-vue-next";
import { computed } from "vue";

import CartLineList from "@/components/merch/CartLineList.vue";
import CartTotals from "@/components/merch/CartTotals.vue";
import Button from "@/components/ui/Button.vue";
import Drawer from "@/components/ui/Drawer.vue";
import type { MerchCopy } from "@/config/merch-copy";
import type { CartLineView, StoreLocale } from "@/types/merch";

const props = defineProps<{
  t: MerchCopy;
  locale: StoreLocale;
  open: boolean;
  cartLines: CartLineView[];
  subtotal: number;
  creditUsed: number;
  creditRemaining: number;
  walletToPay: number;
  creditTotal: number;
  creditKnown: boolean;
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

const itemCount = computed(() =>
  props.cartLines.reduce((total, line) => total + line.quantity, 0),
);
</script>
