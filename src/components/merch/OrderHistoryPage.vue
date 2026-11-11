<template>
  <section class="mx-auto w-full max-w-3xl pt-4">
    <div
      class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"
    >
      <h1 class="t-h1">{{ t.myOrders }}</h1>

      <Button variant="outline" @click="$emit('back')">
        <ArrowLeft class="size-4" />
        {{ t.backToCatalog }}
      </Button>
    </div>

    <p v-if="orders.length === 0" class="text-muted-foreground mt-8 text-sm">
      {{ t.orderHistoryEmpty }}
    </p>

    <article
      v-for="order in orders"
      :key="order.id"
      class="bg-card mt-8 rounded-lg p-5 sm:p-6"
    >
      <header class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="t-h3">{{ order.editionName }}</h2>
          <p class="text-muted-foreground mt-1 text-sm">
            {{ order.placedLabel }}
          </p>
        </div>

        <Badge v-if="order.isCurrentEdition" variant="success">
          {{ t.currentEdition }}
        </Badge>
      </header>

      <ul class="mt-5 divide-y border-t pt-5 text-sm">
        <li
          v-for="line in order.lines"
          :key="line.id"
          class="flex items-start gap-3 py-4 first:pt-0"
        >
          <div class="size-14 shrink-0 overflow-hidden rounded-md bg-white">
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
            <p class="font-semibold break-words">
              {{ line.product.name[locale] }}
            </p>

            <VariantChips :chips="getVariantChips(line, locale)" />

            <p class="text-muted-foreground t-num mt-0.5 text-xs">
              {{ t.quantity }}: {{ line.quantity }}
            </p>
          </div>

          <p class="t-num shrink-0 font-semibold">
            {{ formatCurrency.format(line.lineTotal) }}
          </p>
        </li>
      </ul>

      <dl class="mt-5 space-y-2 border-t pt-5 text-sm">
        <div class="flex items-center justify-between gap-3">
          <dt class="text-muted-foreground">{{ t.subtotal }}</dt>
          <dd class="t-num">{{ formatCurrency.format(order.subtotal) }}</dd>
        </div>

        <div class="flex items-center justify-between gap-3">
          <dt class="text-muted-foreground">{{ t.creditUsed }}</dt>
          <dd class="t-num">
            {{
              order.isCreditKnown
                ? formatCurrency.format(order.creditUsed)
                : t.toBeDetermined
            }}
          </dd>
        </div>

        <div class="flex items-center justify-between gap-3">
          <dt class="font-semibold">{{ t.walletToPay }}</dt>
          <dd class="t-num font-semibold">
            {{
              order.isCreditKnown
                ? formatCurrency.format(order.walletToPay)
                : t.toBeDetermined
            }}
          </dd>
        </div>
      </dl>
    </article>
  </section>
</template>

<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";

import VariantChips from "@/components/merch/VariantChips.vue";
import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";
import type { MerchCopy } from "@/config/merch-copy";
import { getPrimaryImage } from "@/lib/product-images";
import { getVariantChips } from "@/lib/variant-labels";
import type { CartLineView, StoreLocale } from "@/types/merch";

defineProps<{
  t: MerchCopy;
  locale: StoreLocale;
  orders: Array<{
    id: string;
    editionName: string;
    isCurrentEdition: boolean;
    isCreditKnown: boolean;
    placedLabel: string;
    lines: CartLineView[];
    subtotal: number;
    creditUsed: number;
    walletToPay: number;
  }>;
  formatCurrency: Intl.NumberFormat;
}>();

defineEmits<{
  back: [];
}>();
</script>
