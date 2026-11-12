<template>
  <section
    class="animate-fade-up-delay @container mr-(--cart-panel-clearance)"
    aria-labelledby="catalog-heading"
  >
    <!-- Titre, puis les catégories en simples onglets texte. -->
    <div
      class="flex flex-col gap-5 border-b sm:flex-row sm:items-end sm:justify-between"
    >
      <h2 id="catalog-heading" class="t-h2 pb-0 sm:pb-4">
        {{ t.catalogTitle }}
      </h2>
      <div
        role="radiogroup"
        :aria-label="t.categoryFilterLabel"
        class="-mb-px flex flex-wrap gap-x-6"
      >
        <button
          v-for="category in availableCategories"
          :key="category"
          type="button"
          role="radio"
          :aria-checked="activeCategory === category"
          :class="[
            'focus-visible:ring-ring/40 shrink-0 cursor-pointer border-b-2 pt-2 pb-4 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px]',
            activeCategory === category
              ? 'border-foreground text-foreground font-semibold'
              : 'text-muted-foreground hover:text-foreground border-transparent',
          ]"
          @click="$emit('select-category', category)"
        >
          {{ t.categoryLabels[category] }}
        </button>
      </div>
    </div>

    <!--
      Grille aérée: la photo sur une tuile blanche à plat, deux lignes de
      texte dessous. Toute la carte ouvre la fiche.
    -->
    <div
      class="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:mt-10 sm:gap-x-8 sm:gap-y-12 @3xl:grid-cols-3"
    >
      <article
        v-for="product in visibleProducts"
        :key="product.id"
        class="group row-span-3 grid cursor-pointer grid-rows-subgrid gap-y-0 rounded-lg outline-none"
        tabindex="0"
        @click="openProduct(product)"
        @keydown.enter.self.prevent="openProduct(product)"
        @keydown.space.self.prevent="openProduct(product)"
      >
        <div
          class="group-focus-visible:ring-ring/40 overflow-hidden rounded-lg group-focus-visible:ring-[3px]"
        >
          <ProductImageCarousel
            :id="product.id"
            :alt="product.name[locale]"
            :image-gallery="getCardImages(product)"
            quiet-controls
            class-name="aspect-[4/5] w-full"
          />
        </div>

        <div
          class="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
        >
          <div class="min-w-0">
            <h3 class="text-[15px] leading-snug font-semibold">
              {{ product.name[locale] }}
            </h3>
            <p class="t-num text-muted-foreground mt-0.5 text-[15px] leading-snug">
              {{ formatCurrency.format(product.price) }}
            </p>
          </div>

          <!-- Une action discrète: un lien texte, pas un bouton encadré. -->
          <template v-if="!viewOnly">
            <TooltipProvider v-if="isGiftCardLimitReached(product.id)">
              <Tooltip>
                <TooltipTrigger as-child>
                  <span
                    class="text-muted-foreground mt-auto shrink-0 cursor-default self-start text-sm sm:mt-0"
                    tabindex="0"
                    @click.stop
                  >
                    {{ t.addedShort }}
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
            <button
              v-else
              type="button"
              class="bg-encre/6 text-foreground hover:bg-encre/12 focus-visible:ring-ring/40 mt-auto inline-flex h-9 shrink-0 cursor-pointer items-center self-start rounded-full px-3.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-[3px] sm:mt-0"
              @click.stop="quickAdd(product)"
            >
              {{ needsVariantChoice(product) ? t.selectVariant : t.addShort }}
            </button>
          </template>
        </div>

        <!-- Un produit, plusieurs couleurs: une pastille par couleur. -->
        <div
          v-if="getColorGroup(product)"
          class="mt-3 flex items-center gap-2.5 self-start"
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
          <span class="text-muted-foreground hidden truncate text-xs sm:inline">
            {{ getSelectedColorLabel(product) }}
          </span>
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
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

import ProductImageCarousel from "@/components/merch/ProductImageCarousel.vue";
import ColorSwatches from "@/components/ui/ColorSwatches.vue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MerchCopy } from "@/config/merch-copy";
import { categoryOrder } from "@/config/merch-store";
import {
  getMaxQuantityForProductId,
  isGiftCardProductId,
} from "@/lib/merch-quantity";
import { getImagesForSelection } from "@/lib/product-images";
import type { Category, Product, StoreLocale } from "@/types/merch";

const props = withDefaults(
  defineProps<{
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
    activeCategory?: "all" | Category;
  }>(),
  { activeCategory: "all" },
);

const emit = defineEmits<{
  "open-product": [productId: string, initialOptions: Record<string, string>];
  "quick-add": [productId: string, initialOptions: Record<string, string>];
  "select-category": [category: "all" | Category];
}>();

const INITIAL_VISIBLE = 12;
const PAGE_SIZE = 9;

const visibleCount = ref(INITIAL_VISIBLE);
const loadMoreSentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

// --- Catégories ------------------------------------------------------------
// Seules les catégories qui contiennent au moins un produit sont proposées.
const availableCategories = computed(() =>
  categoryOrder.filter(
    (category) =>
      category === "all" ||
      props.products.some((product) => product.category === category),
  ),
);

const filteredProducts = computed(() =>
  props.activeCategory === "all"
    ? props.products
    : props.products.filter(
        (product) => product.category === props.activeCategory,
      ),
);

const visibleProducts = computed(() =>
  filteredProducts.value.slice(0, visibleCount.value),
);
const hasMore = computed(
  () => visibleCount.value < filteredProducts.value.length,
);

const loadMore = () => {
  if (!hasMore.value) {
    return;
  }
  visibleCount.value = Math.min(
    visibleCount.value + PAGE_SIZE,
    filteredProducts.value.length,
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

const productQuantityInCart = (productId: string) =>
  props.cartLines
    .filter((line) => line.product.id === productId)
    .reduce((total, line) => total + line.quantity, 0);
const isGiftCardLimitReached = (productId: string) =>
  isGiftCardProductId(productId) &&
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
  () => [props.products.length, props.activeCategory] as const,
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
