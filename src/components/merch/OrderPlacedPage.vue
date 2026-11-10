<template>
  <section
    class="mx-auto flex min-h-[calc(80vh-12rem)] w-full max-w-7xl flex-col items-center justify-center gap-6 px-4"
  >
    <div class="bg-card w-full max-w-md overflow-hidden rounded-lg border shadow-md">
      <span class="ruban rounded-none" aria-hidden="true" />
      <div class="px-6 pt-6 text-center">
        <span
          class="bg-vert-pale text-vert mx-auto flex size-11 items-center justify-center rounded-full"
          aria-hidden="true"
        >
          <Check class="size-5" />
        </span>
        <h1 class="t-h2 mt-4">{{ t.placedPageTitle }}</h1>
        <p class="text-muted-foreground mx-auto mt-2 max-w-sm text-sm">
          {{ t.placedPageBody }}
        </p>
      </div>
      <div class="space-y-4 p-6">
        <div v-if="recapLines.length > 0" class="bg-secondary/60 rounded-md border p-3">
          <p class="mb-3 text-sm font-semibold">Résumé des articles commandés</p>
          <ul class="space-y-3 text-sm">
            <li v-for="line in recapLines" :key="line.id">
              <div class="flex items-start gap-3">
                <div
                  class="size-12 shrink-0 overflow-hidden rounded-md border bg-white"
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
                <div class="min-w-0">
                  <p class="font-semibold break-words">
                    {{ line.product.name[locale] }}
                  </p>
                  <VariantChips :chips="getVariantChips(line, locale)" />
                  <p class="text-muted-foreground t-num mt-0.5 text-xs">
                    Qté: {{ line.quantity }}
                  </p>
                </div>
              </div>
            </li>
          </ul>
          <p v-if="remainingCount > 0" class="text-muted-foreground mt-3 text-xs">
            +{{ remainingCount }} autre(s) article(s)
          </p>
        </div>
        <div class="mx-auto grid w-full max-w-md gap-2">
          <Button size="lg" @click="$emit('back')">
            {{ t.backToCatalog }}
          </Button>
          <Button
            v-if="!viewOnly"
            variant="outline"
            :disabled="lockActionBusy"
            @click="$emit('unlock-and-back')"
          >
            <LockOpen class="size-4" />
            {{ t.unlockOrder }}
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Check, LockOpen } from "lucide-vue-next";
import { computed } from "vue";

import VariantChips from "@/components/merch/VariantChips.vue";
import Button from "@/components/ui/Button.vue";
import type { MerchCopy } from "@/config/merch-copy";
import { getPrimaryImage } from "@/lib/product-images";
import { getVariantChips } from "@/lib/variant-labels";
import type { CartLineView, StoreLocale } from "@/types/merch";

const props = defineProps<{
  t: MerchCopy;
  locale: StoreLocale;
  cartLines: CartLineView[];
  deadlineLabel: string;
  lockActionBusy?: boolean;
  viewOnly?: boolean;
}>();

defineEmits<{
  back: [];
  "unlock-and-back": [];
}>();

const recapLines = computed(() => props.cartLines.slice(0, 4));
const remainingCount = computed(() =>
  Math.max(props.cartLines.length - recapLines.value.length, 0),
);
</script>
