<template>
  <Drawer :open="open" :title="t.productDetails" @close="$emit('close')">
    <div v-if="product" class="mx-auto max-w-6xl">
      <div class="mb-4 flex justify-end">
        <Button variant="ghost" size="icon" @click="$emit('close')">
          <X class="size-4" />
        </Button>
      </div>

      <div class="grid gap-5 md:grid-cols-[1.35fr_0.65fr]">
        <ProductImageCarousel
          :id="product.id"
          :alt="product.name[locale]"
          :image-gallery="product.imageGallery"
          :gradient-class="product.gradientClass"
          class-name="h-[22rem] border md:h-[30rem]"
        />

        <div class="bg-muted/20 flex max-h-[70vh] flex-col rounded-xl border p-4">
          <div class="space-y-4 overflow-y-auto pb-4">
            <div>
              <h2 class="text-xl font-semibold">{{ product.name[locale] }}</h2>
              <p class="text-muted-foreground text-sm">
                {{ product.description[locale] }}
              </p>
              <p class="mt-2 text-base font-semibold">
                {{ formatCurrency.format(product.price) }}
              </p>
            </div>

            <div v-for="group in variantGroups" :key="group.id">
              <p class="mb-2 text-sm font-medium">{{ group.label[locale] }}</p>
              <div class="flex flex-wrap gap-2">
                <Button
                  v-for="option in group.options"
                  :key="option.id"
                  size="sm"
                  :variant="
                    selections[group.id] === option.id ? 'default' : 'outline'
                  "
                  class="gap-2"
                  @click="setSelection(group.id, option.id)"
                >
                  <span
                    v-if="group.type === 'color' && option.swatchHex"
                    class="inline-block h-3 w-3 rounded-full border"
                    :style="{ backgroundColor: option.swatchHex }"
                  />
                  {{ option.label[locale] }}
                </Button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">{{ t.quantity }}</span>
              <QuantityStepper v-model="quantity" :min="1" :max="25" />
            </div>
          </div>

          <div
            class="sticky bottom-0 mt-2 border-t bg-muted/20 pt-3"
            style="padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 0.25rem);"
          >
            <Button class="w-full" :disabled="readOnly" @click="addSelectionToCart">
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
import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";
import Drawer from "@/components/ui/Drawer.vue";
import QuantityStepper from "@/components/ui/QuantityStepper.vue";
import type { MerchCopy } from "@/config/merch-copy";
import type { Product, StoreLocale } from "@/types/merch";

const props = defineProps<{
  t: MerchCopy;
  locale: StoreLocale;
  product: Product | null;
  open: boolean;
  formatCurrency: Intl.NumberFormat;
  readOnly?: boolean;
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
  () => props.product?.id,
  () => {
    selections.value = Object.fromEntries(
      (props.product?.variantGroups ?? []).map((group) => [
        group.id,
        group.options[0]?.id ?? "",
      ]),
    );
    quantity.value = 1;
  },
  { immediate: true },
);

const variantGroups = computed(() => props.product?.variantGroups ?? []);

const selectedVariantLabels = computed(() =>
  variantGroups.value
    .map((group) => {
      const selected = group.options.find(
        (option) => option.id === selections.value[group.id],
      );
      if (!selected) {
        return null;
      }

      return `${group.label[props.locale]}: ${selected.label[props.locale]}`;
    })
    .filter((value): value is string => Boolean(value)),
);

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
