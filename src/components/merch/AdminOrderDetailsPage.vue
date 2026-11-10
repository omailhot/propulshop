<template>
  <section>
    <div class="bg-card rounded-lg border shadow-sm">
      <div
        class="flex flex-col items-start justify-between gap-3 px-5 pt-5 sm:flex-row sm:items-center sm:px-6 sm:pt-6"
      >
        <div>
          <p class="t-eyebrow">Administration</p>
          <h1 class="t-h2 mt-2">Détail de la commande</h1>
          <p class="text-muted-foreground mt-1 text-sm">
            Les articles soumis, avec le fournisseur de chacun.
          </p>
        </div>
        <Button variant="outline" @click="$emit('back')">
          <ArrowLeft class="size-4" />
          Retour en arrière
        </Button>
      </div>
      <div class="p-5 sm:p-6">
        <div
          v-if="cartLines.length === 0"
          class="border-input rounded-lg border border-dashed p-6 text-center"
        >
          <p class="font-semibold">{{ t.emptyCart }}</p>
          <p class="text-muted-foreground text-sm">{{ t.addFromCatalog }}</p>
        </div>

        <ul v-else class="space-y-3">
          <li
            v-for="line in cartLines"
            :key="line.id"
            class="rounded-lg border p-4"
          >
            <div class="flex items-start gap-4">
              <div
                class="size-20 shrink-0 overflow-hidden rounded-md border bg-white"
              >
                <img
                  v-if="getPrimaryImage(line.product, line.selectedOptions)"
                  :src="
                    getPrimaryImage(line.product, line.selectedOptions) ?? ''
                  "
                  :alt="line.product.name[locale]"
                  class="size-full object-contain p-1"
                  loading="lazy"
                />
                <div v-else class="matiere size-full" aria-hidden="true" />
              </div>
              <div
                class="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
              >
                <div class="min-w-0">
                  <p class="font-semibold break-words">
                    {{ line.product.name[locale] }}
                  </p>
                  <VariantChips
                    :chips="getVariantChips(line, locale)"
                    :fallback="t.noVariants"
                  />
                  <p class="text-muted-foreground t-num mt-0.5 text-xs">
                    {{ t.quantity }}: {{ line.quantity }}
                  </p>
                  <Badge variant="outline" class="mt-2 gap-1.5">
                    <span
                      class="size-2 rounded-full"
                      :style="{ backgroundColor: getSupplierDot(line) }"
                      aria-hidden="true"
                    />
                    {{ getSupplierName(line.product.supplier) }}
                  </Badge>
                </div>
                <p class="t-num shrink-0 font-semibold">
                  {{ formatCurrency.format(line.lineTotal) }}
                </p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";

import VariantChips from "@/components/merch/VariantChips.vue";
import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";
import type { MerchCopy } from "@/config/merch-copy";
import { getSupplierName, SUPPLIERS } from "@/config/suppliers";
import { getPrimaryImage } from "@/lib/product-images";
import { getVariantChips } from "@/lib/variant-labels";
import type { CartLineView, StoreLocale } from "@/types/merch";

defineProps<{
  t: MerchCopy;
  locale: StoreLocale;
  cartLines: CartLineView[];
  formatCurrency: Intl.NumberFormat;
}>();

defineEmits<{
  back: [];
}>();

const getSupplierDot = (line: CartLineView) =>
  line.product.supplier
    ? SUPPLIERS[line.product.supplier].dot
    : "var(--p-encre-3)";
</script>
