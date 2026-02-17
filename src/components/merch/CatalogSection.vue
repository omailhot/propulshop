<template>
  <section class="animate-fade-up-delay space-y-4">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="product in visibleProducts"
        :key="product.id"
        class="flex h-full cursor-pointer flex-col rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        tabindex="0"
        @click="$emit('open-product', product.id)"
        @keydown.enter.prevent="$emit('open-product', product.id)"
        @keydown.space.prevent="$emit('open-product', product.id)"
      >
        <ProductImageCarousel
          :id="product.id"
          :alt="product.name[locale]"
          :image-gallery="product.imageGallery"
          :gradient-class="product.gradientClass"
          class-name="mb-4 h-40"
        />

        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-semibold">{{ product.name[locale] }}</h3>
            <p class="mt-1 text-sm text-muted-foreground">{{ product.description[locale] }}</p>
          </div>
          <div class="text-right">
            <p class="font-semibold">{{ formatCurrency.format(product.price) }}</p>
            <p class="text-xs text-muted-foreground">{{ t.perItem }}</p>
          </div>
        </div>

        <p v-if="(product.variantGroups ?? []).length > 0" class="mt-3 text-xs text-muted-foreground">
          {{ (product.variantGroups ?? []).length }} {{ t.variants }}
        </p>

        <div class="mt-auto grid grid-cols-2 gap-2 pt-4">
          <Button variant="outline" @click.stop="$emit('open-product', product.id)">
            {{ t.viewDetails }}
          </Button>
          <Button @click.stop="$emit('quick-add', product.id)">
            <ShoppingCart class="size-4" />
            {{ (product.variantGroups ?? []).length > 0 ? t.selectVariant : t.quickAdd }}
          </Button>
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
import { ShoppingCart } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import ProductImageCarousel from '@/components/merch/ProductImageCarousel.vue'
import Button from '@/components/ui/Button.vue'
import type { MerchCopy } from '@/config/merch-copy'
import type { Product, StoreLocale } from '@/types/merch'

const props = defineProps<{
  t: MerchCopy
  locale: StoreLocale
  products: Product[]
  formatCurrency: Intl.NumberFormat
}>()

defineEmits<{
  'open-product': [productId: string]
  'quick-add': [productId: string]
}>()

const INITIAL_VISIBLE = 9
const PAGE_SIZE = 6

const visibleCount = ref(INITIAL_VISIBLE)
const loadMoreSentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const visibleProducts = computed(() => props.products.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < props.products.length)

const loadMore = () => {
  if (!hasMore.value) {
    return
  }
  visibleCount.value = Math.min(visibleCount.value + PAGE_SIZE, props.products.length)
}

const reconnectObserver = () => {
  observer?.disconnect()
  if (!loadMoreSentinel.value || !hasMore.value) {
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadMore()
      }
    },
    { rootMargin: '280px 0px' },
  )
  observer.observe(loadMoreSentinel.value)
}

watch(
  () => props.products.length,
  () => {
    visibleCount.value = INITIAL_VISIBLE
    reconnectObserver()
  },
)

watch(loadMoreSentinel, () => reconnectObserver())
watch(hasMore, () => reconnectObserver())

onMounted(() => reconnectObserver())
onUnmounted(() => observer?.disconnect())
</script>
