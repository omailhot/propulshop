<template>
  <div v-if="cartLines.length === 0" class="py-10 text-center">
    <p class="font-semibold">{{ t.emptyCart }}</p>
    <p class="text-muted-foreground mt-1 text-sm">{{ t.addFromCatalog }}</p>
  </div>

  <!-- Une liste à plat: des filets entre les lignes, pas de cartes. -->
  <ul v-else class="divide-y">
    <li
      v-for="line in cartLines"
      :key="line.id"
      class="flex items-start gap-4 py-4 first:pt-0"
    >
      <div class="size-16 shrink-0 overflow-hidden rounded-md bg-white">
        <img
          v-if="getPrimaryImage(line.product, line.selectedOptions)"
          :src="getPrimaryImage(line.product, line.selectedOptions) ?? ''"
          :alt="line.product.name[locale]"
          class="size-full object-contain p-1"
          loading="lazy"
        />
        <div v-else class="bg-secondary size-full" aria-hidden="true" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-3">
          <p class="min-w-0 leading-snug font-semibold break-words">
            {{ line.product.name[locale] }}
          </p>
          <p class="t-num shrink-0">
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

        <div class="mt-3 flex items-center justify-between">
          <QuantityStepper
            :model-value="line.quantity"
            :max="getMaxQuantityForProductId(line.product.id ?? '')"
            :disabled="readOnly"
            @update:model-value="
              (nextQuantity) =>
                $emit('update-item-quantity', line.id, nextQuantity)
            "
          />
          <button
            type="button"
class="text-foreground hover:bg-encre/8 focus-visible:ring-ring/40 inline-flex h-9 cursor-pointer items-center rounded-md px-3 text-sm outline-none transition-colors focus-visible:ring-[3px] -mr-3 disabled:pointer-events-none disabled:opacity-50"
            :disabled="readOnly"
            @click="$emit('remove-item', line.id)"
          >
            {{ t.removeItem }}
          </button>
        </div>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import VariantChips from "@/components/merch/VariantChips.vue";
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
