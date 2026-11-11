<template>
  <section
    class="mx-auto flex min-h-[calc(80vh-12rem)] w-full max-w-7xl flex-col items-center justify-center gap-6 px-4"
  >
    <div class="w-full max-w-md">
      <div class="text-center">
        <Check class="text-vert mx-auto size-6" aria-hidden="true" />
        <h1 class="t-h1 mt-4">{{ t.placedPageTitle }}</h1>
        <p class="text-muted-foreground mx-auto mt-3 max-w-sm text-sm">
          {{ t.placedPageBody }}
        </p>
      </div>
      <div class="mt-10 space-y-8">
        <div v-if="recapLines.length > 0" class="border-t pt-6">
          <ul class="divide-y text-sm">
            <li
              v-for="line in recapLines"
              :key="line.id"
              class="py-4 first:pt-0"
            >
              <div class="flex items-start gap-3">
                <div
                  class="size-14 shrink-0 overflow-hidden rounded-md bg-white"
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
          <Button v-if="canEdit" variant="outline" @click="$emit('edit-order')">
            <Pencil class="size-4" />
            {{ t.modifyOrder }}
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Check, Pencil } from "lucide-vue-next";
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
  canEdit: boolean;
}>();

defineEmits<{
  back: [];
  "edit-order": [];
}>();

const recapLines = computed(() => props.cartLines.slice(0, 4));
const remainingCount = computed(() =>
  Math.max(props.cartLines.length - recapLines.value.length, 0),
);
</script>
