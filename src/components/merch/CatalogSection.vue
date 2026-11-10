<template>
  <section class="animate-fade-up-delay space-y-4">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="product in visibleProducts"
        :key="product.id"
        class="bg-card focus-visible:ring-ring/40 flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border shadow-sm transition-shadow outline-none hover:shadow-md focus-visible:ring-[3px]"
        tabindex="0"
        @click="openProduct(product)"
        @keydown.enter.prevent="openProduct(product)"
        @keydown.space.prevent="openProduct(product)"
      >
        <ProductImageCarousel
          :id="product.id"
          :alt="product.name[locale]"
          :image-gallery="getCardImages(product)"
          class-name="h-72 border-b"
        />

        <div class="flex flex-1 flex-col p-4">
          <div class="flex items-start justify-between gap-3">
            <h3 class="min-w-0 text-[15px] leading-snug font-semibold">
              {{ product.name[locale] }}
            </h3>
            <p class="t-num shrink-0 text-right leading-snug font-semibold">
              {{ formatCurrency.format(product.price) }}
            </p>
          </div>

          <p
            v-if="getCardDescription(product)"
            class="text-muted-foreground mt-1.5 text-sm"
          >
            {{ getCardDescription(product) }}
          </p>

          <!-- Un produit, plusieurs couleurs: une pastille par couleur. -->
          <div
            v-if="getColorGroup(product)"
            class="mt-3 flex items-center gap-2.5"
          >
            <ColorSwatches
              size="sm"
              :label="t.colorLabel"
              :options="getSwatchOptions(product)"
              :model-value="getSelectedColor(product)"
              @update:model-value="
                (colorId) => setSelectedColor(product.id, colorId)
              "
            />
            <span class="text-muted-foreground text-xs">
              {{ getSelectedColorLabel(product) }}
            </span>
          </div>

          <p
            v-if="isGiftCardProduct(product.id)"
            class="text-muted-foreground mt-2 text-xs"
          >
            {{ t.giftCardQuantityLimit }}
          </p>

          <div
            :class="[
              'mt-auto grid gap-2 pt-4',
              viewOnly ? 'grid-cols-1' : 'grid-cols-2',
            ]"
          >
            <Button variant="outline" @click.stop="openProduct(product)">
              {{ t.viewDetails }}
            </Button>
            <TooltipProvider
              v-if="!viewOnly && isGiftCardLimitReached(product.id)"
            >
              <Tooltip>
                <TooltipTrigger as-child>
                  <span class="inline-flex w-full" @click.stop>
                    <Button variant="brand" class="w-full" disabled @click.stop>
                      <ShoppingCart class="size-4" />
                      {{ t.quickAdd }}
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  :side-offset="8"
                  class="bg-encre text-grege z-[90] max-w-80 rounded-md px-3 py-2 text-[13px] leading-relaxed font-normal shadow-lg"
                >
                  {{ t.giftCardLimitReached }}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <!--
              Contour braise, pas de fond plein: le seul bouton plein de
              l'écran est celui qui mène à la confirmation du panier.
            -->
            <Button
              v-else-if="!viewOnly"
              variant="brand"
              @click.stop="quickAdd(product)"
            >
              <ShoppingCart class="size-4" />
              {{ needsVariantChoice(product) ? t.selectVariant : t.quickAdd }}
            </Button>
          </div>
        </div>
      </article>
    </div>

    <div
      v-if="hasMore"
      ref="loadMoreSentinel"
      class="h-10 w-full"
      aria-hidden="true"
    />
  </section>
</template>

<script setup lang="ts">
import { ShoppingCart } from "lucide-vue-next";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

import ProductImageCarousel from "@/components/merch/ProductImageCarousel.vue";
import Button from "@/components/ui/Button.vue";
import ColorSwatches from "@/components/ui/ColorSwatches.vue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MerchCopy } from "@/config/merch-copy";
import { markdownToPlainText } from "@/lib/markdown";
import {
  getMaxQuantityForProductId,
  isGiftCardProductId,
} from "@/lib/merch-quantity";
import { getImagesForSelection } from "@/lib/product-images";
import type { Product, StoreLocale } from "@/types/merch";

const props = defineProps<{
  t: MerchCopy;
  locale: StoreLocale;
  products: Product[];
  cartLines: Array<{
    quantity: number;
    product: {
      id?: string;
    };
  }>;
  formatCurrency: Intl.NumberFormat;
  viewOnly?: boolean;
}>();

const emit = defineEmits<{
  "open-product": [productId: string, initialOptions: Record<string, string>];
  "quick-add": [productId: string, initialOptions: Record<string, string>];
}>();

const INITIAL_VISIBLE = 9;
const PAGE_SIZE = 6;

const visibleCount = ref(INITIAL_VISIBLE);
const loadMoreSentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const visibleProducts = computed(() =>
  props.products.slice(0, visibleCount.value),
);
const hasMore = computed(() => visibleCount.value < props.products.length);

const loadMore = () => {
  if (!hasMore.value) {
    return;
  }
  visibleCount.value = Math.min(
    visibleCount.value + PAGE_SIZE,
    props.products.length,
  );
};

// --- Pastilles de couleur --------------------------------------------------
// La couleur choisie sur une carte change sa photo et suit le produit dans
// la fiche détaillée.
const selectedColors = ref<Record<string, string>>({});

const getColorGroup = (product: Product) =>
  (product.variantGroups ?? []).find((group) => group.type === "color") ?? null;

const getSwatchOptions = (product: Product) =>
  (getColorGroup(product)?.options ?? []).map((option) => ({
    id: option.id,
    label: option.label[props.locale],
    hex: option.swatchHex ?? "#FFFFFF",
  }));

const getSelectedColor = (product: Product) =>
  selectedColors.value[product.id] ??
  getColorGroup(product)?.options[0]?.id ??
  null;

const getSelectedColorLabel = (product: Product) => {
  const selected = getSelectedColor(product);
  return (
    getColorGroup(product)?.options.find((option) => option.id === selected)
      ?.label[props.locale] ?? ""
  );
};

const setSelectedColor = (productId: string, colorId: string) => {
  selectedColors.value = { ...selectedColors.value, [productId]: colorId };
};

const getInitialOptions = (product: Product): Record<string, string> => {
  const group = getColorGroup(product);
  const selected = getSelectedColor(product);
  return group && selected ? { [group.id]: selected } : {};
};

// La couleur se choisit sur la carte. Seules les autres options (taille,
// visuel) obligent à ouvrir la fiche avant d'ajouter au panier.
const needsVariantChoice = (product: Product) =>
  (product.variantGroups ?? []).some((group) => group.type !== "color");

const getCardImages = (product: Product) =>
  getImagesForSelection(product, getInitialOptions(product));

const openProduct = (product: Product) => {
  emit("open-product", product.id, getInitialOptions(product));
};

const quickAdd = (product: Product) => {
  emit("quick-add", product.id, getInitialOptions(product));
};

const MAX_CARD_DESCRIPTION_LENGTH = 110;

const getCardDescription = (product: Product) => {
  const text = markdownToPlainText(product.description[props.locale]);
  if (text.length <= MAX_CARD_DESCRIPTION_LENGTH) {
    return text;
  }
  return `${text.slice(0, MAX_CARD_DESCRIPTION_LENGTH - 1).trimEnd()}…`;
};

const isGiftCardProduct = (productId: string) => isGiftCardProductId(productId);
const productQuantityInCart = (productId: string) =>
  props.cartLines
    .filter((line) => line.product.id === productId)
    .reduce((total, line) => total + line.quantity, 0);
const isGiftCardLimitReached = (productId: string) =>
  isGiftCardProduct(productId) &&
  productQuantityInCart(productId) >= getMaxQuantityForProductId(productId);

const reconnectObserver = () => {
  observer?.disconnect();
  if (!loadMoreSentinel.value || !hasMore.value) {
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadMore();
      }
    },
    { rootMargin: "280px 0px" },
  );
  observer.observe(loadMoreSentinel.value);
};

watch(
  () => props.products.length,
  () => {
    visibleCount.value = INITIAL_VISIBLE;
    reconnectObserver();
  },
);

watch(loadMoreSentinel, () => reconnectObserver());
watch(hasMore, () => reconnectObserver());

onMounted(() => reconnectObserver());
onUnmounted(() => observer?.disconnect());
</script>
