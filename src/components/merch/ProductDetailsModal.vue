<template>
  <Drawer :open="open" :title="t.productDetails" @close="$emit('close')">
    <div
      v-if="product"
      class="mx-auto max-h-[calc(86dvh-2rem)] w-full max-w-7xl overflow-y-auto pr-1"
    >
      <div class="mb-2 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          :aria-label="t.closeLabel"
          @click="$emit('close')"
        >
          <X class="size-4" />
        </Button>
      </div>

      <div class="grid w-full gap-5 md:grid-cols-[1.35fr_0.65fr]">
        <ProductImageCarousel
          :id="product.id"
          :alt="product.name[locale]"
          :image-gallery="variantImageGallery"
          :zoomable="true"
          class-name="h-64 rounded-lg sm:h-[22rem] md:h-[30rem]"
        />

        <div
          class="flex min-h-0 flex-col md:max-h-[70vh]"
        >
          <div
            class="min-h-0 flex-1 space-y-6 px-1 pb-5 md:overflow-y-auto md:px-4"
          >
            <div>
              <p class="text-muted-foreground text-sm">
                {{ t.categoryLabels[product.category] }}
              </p>
              <h2 class="t-h2 mt-1">
                {{ product.name[locale] }}
              </h2>
              <p class="t-num text-muted-foreground mt-2 text-lg">
                {{ formatCurrency.format(unitPrice) }}
              </p>
              <div
                v-if="descriptionHtml"
                class="prose-produit text-muted-foreground mt-3 text-sm"
                v-html="descriptionHtml"
              />
            </div>

            <div v-for="group in variantGroups" :key="group.id">
              <p class="mb-2 text-sm">
                <span class="font-semibold">{{ group.label[locale] }}</span>
                <span
                  v-if="getSelectedLabel(group)"
                  class="text-muted-foreground"
                >
                  : {{ getSelectedLabel(group) }}
                </span>
              </p>

              <ColorSwatches
                v-if="group.type === 'color'"
                :label="group.label[locale]"
                :options="toSwatchOptions(group)"
                :model-value="selections[group.id]"
                @update:model-value="
                  (optionId) => setSelection(group.id, optionId)
                "
              />

              <!--
                Le choix actif passe à l'encre, pas au braise: le bouton
                plein braise reste unique sur cet écran.
              -->
              <div
                v-else
                role="radiogroup"
                :aria-label="group.label[locale]"
                class="flex flex-wrap gap-2"
              >
                <button
                  v-for="option in group.options"
                  :key="option.id"
                  type="button"
                  role="radio"
                  :aria-checked="selections[group.id] === option.id"
                  :class="[
                    'focus-visible:ring-ring/40 inline-flex h-9 min-w-11 cursor-pointer items-center justify-center rounded-md border px-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-[3px]',
                    selections[group.id] === option.id
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-input bg-card text-foreground hover:bg-accent',
                  ]"
                  @click="setSelection(group.id, option.id)"
                >
                  {{ option.label[locale] }}
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between gap-3">
              <div>
                <span class="text-sm font-semibold">{{ t.quantity }}</span>
                <p
                  v-if="isGiftCardProduct"
                  class="text-muted-foreground mt-0.5 text-xs"
                >
                  {{ t.giftCardQuantityLimit }}
                </p>
              </div>
              <QuantityStepper v-model="quantity" :min="1" :max="maxQuantity" />
            </div>
          </div>

          <div
            class="bg-background sticky bottom-0 border-t px-1 pt-4 md:static md:px-4"
            style="
              padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 1rem);
            "
          >
            <Button
              class="w-full"
              size="lg"
              :disabled="readOnly"
              @click="addSelectionToCart"
            >
              {{ t.addSelection }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { X } from "lucide-vue-next";
import { computed, ref, watch } from "vue";

import ProductImageCarousel from "@/components/merch/ProductImageCarousel.vue";
import Button from "@/components/ui/Button.vue";
import ColorSwatches from "@/components/ui/ColorSwatches.vue";
import Drawer from "@/components/ui/Drawer.vue";
import QuantityStepper from "@/components/ui/QuantityStepper.vue";
import type { MerchCopy } from "@/config/merch-copy";
import { renderMarkdown } from "@/lib/markdown";
import { resolveOrderProductSelection } from "@/lib/merch-order";
import {
  getMaxQuantityForProductId,
  isGiftCardProductId,
} from "@/lib/merch-quantity";
import { getImagesForSelection } from "@/lib/product-images";
import type { Product, ProductVariantGroup, StoreLocale } from "@/types/merch";

const props = defineProps<{
  t: MerchCopy;
  locale: StoreLocale;
  product: Product | null;
  open: boolean;
  formatCurrency: Intl.NumberFormat;
  readOnly?: boolean;
  /** Sélection de départ, ex. la couleur choisie sur la carte du catalogue. */
  initialOptions?: Record<string, string>;
}>();

const emit = defineEmits<{
  close: [];
  "add-to-cart": [
    input: {
      productId: string;
      selectedOptions: Record<string, string>;
      quantity: number;
    },
  ];
}>();

const selections = ref<Record<string, string>>({});
const quantity = ref(1);

watch(
  () => [props.product?.id, props.open] as const,
  () => {
    if (!props.open) {
      return;
    }
    selections.value = Object.fromEntries(
      (props.product?.variantGroups ?? []).map((group) => {
        const preset = props.initialOptions?.[group.id];
        const hasPreset = group.options.some((option) => option.id === preset);
        return [group.id, hasPreset && preset ? preset : (group.options[0]?.id ?? "")];
      }),
    );
    quantity.value = 1;
  },
  { immediate: true },
);

const variantGroups = computed(() => props.product?.variantGroups ?? []);
const maxQuantity = computed(() =>
  props.product ? getMaxQuantityForProductId(props.product.id) : 25,
);
const isGiftCardProduct = computed(() =>
  props.product ? isGiftCardProductId(props.product.id) : false,
);
const unitPrice = computed(() =>
  props.product
    ? resolveOrderProductSelection(props.product, selections.value).unitPrice
    : 0,
);
const descriptionHtml = computed(() =>
  props.product ? renderMarkdown(props.product.description[props.locale]) : "",
);
const variantImageGallery = computed(() =>
  props.product ? getImagesForSelection(props.product, selections.value) : [],
);

const toSwatchOptions = (group: ProductVariantGroup) =>
  group.options.map((option) => ({
    id: option.id,
    label: option.label[props.locale],
    hex: option.swatchHex ?? "#FFFFFF",
  }));

const getSelectedLabel = (group: ProductVariantGroup) =>
  group.options.find((option) => option.id === selections.value[group.id])
    ?.label[props.locale] ?? "";

const setSelection = (groupId: string, optionId: string) => {
  selections.value = {
    ...selections.value,
    [groupId]: optionId,
  };
};

const addSelectionToCart = () => {
  if (!props.product) {
    return;
  }

  emit("add-to-cart", {
    productId: props.product.id,
    selectedOptions: selections.value,
    quantity: quantity.value,
  });

  emit("close");
};
</script>
