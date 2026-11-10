<template>
  <div
    v-if="cartLines.length === 0"
    class="border-input rounded-lg border border-dashed p-6 text-center"
  >
    <ShoppingBasket class="text-muted-foreground mx-auto mb-2 size-5" />
    <p class="font-semibold">{{ t.emptyCart }}</p>
    <p class="text-muted-foreground text-sm">{{ t.addFromCatalog }}</p>
  </div>

  <ul v-else class="space-y-3">
    <li
      v-for="line in cartLines"
      :key="line.id"
      class="bg-card rounded-lg border p-3"
    >
      <div class="flex items-start gap-3">
        <div
          class="size-14 shrink-0 overflow-hidden rounded-md border bg-white"
        >
          <img
            v-if="getPrimaryImage(line.product, line.selectedOptions)"
            :src="getPrimaryImage(line.product, line.selectedOptions) ?? ''"
            :alt="line.product.name[locale]"
            class="size-full object-contain p-1"
            loading="lazy"
          />
          <div v-else class="matiere size-full" aria-hidden="true" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-2">
            <p class="min-w-0 leading-snug font-semibold break-words">
              {{ line.product.name[locale] }}
            </p>
            <p class="t-num shrink-0 font-semibold">
              {{ formatCurrency.format(line.lineTotal) }}
            </p>
          </div>
          <VariantChips :chips="getVariantChips(line, locale)" />
          <p
            v-if="line.product.id && isGiftCardProductId(line.product.id)"
            class="text-muted-foreground mt-0.5 text-xs"
          >
            {{ t.giftCardQuantityLimit }}
          </p>
        </div>
      </div>

      <div class="mt-3 flex items-center justify-between">
        <QuantityStepper
          :model-value="line.quantity"
          :max="getMaxQuantityForProductId(line.product.id ?? '')"
          :disabled="readOnly"
          @update:model-value="
            (nextQuantity) => $emit('update-item-quantity', line.id, nextQuantity)
          "
        />

        <Button
          variant="ghost"
          size="sm"
          :disabled="readOnly"
          @click="$emit('remove-item', line.id)"
        >
          {{ t.removeItem }}
        </Button>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ShoppingBasket } from "lucide-vue-next";

import VariantChips from "@/components/merch/VariantChips.vue";
import Button from "@/components/ui/Button.vue";
import QuantityStepper from "@/components/ui/QuantityStepper.vue";
import type { MerchCopy } from "@/config/merch-copy";
import {
  getMaxQuantityForProductId,
  isGiftCardProductId,
} from "@/lib/merch-quantity";
import { getPrimaryImage } from "@/lib/product-images";
import { getVariantChips } from "@/lib/variant-labels";
import type { CartLineView, StoreLocale } from "@/types/merch";

defineProps<{
  t: MerchCopy;
  locale: StoreLocale;
  cartLines: CartLineView[];
  formatCurrency: Intl.NumberFormat;
  readOnly?: boolean;
}>();

defineEmits<{
  "remove-item": [cartItemId: string];
  "update-item-quantity": [cartItemId: string, nextQuantity: number];
}>();
</script>
