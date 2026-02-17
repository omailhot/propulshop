<template>
  <section class="animate-fade-up-delay">
    <Card class="shadow-md">
      <CardHeader class="space-y-4">
        <div class="relative lg:max-w-sm lg:flex-1">
          <SlidersHorizontal class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input v-model="searchValue" type="search" :placeholder="t.search" class="pl-9" />
        </div>
      </CardHeader>

      <CardContent>
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="product in filteredProducts"
            :key="product.id"
            class="flex h-full cursor-pointer flex-col rounded-2xl bg-card/85 p-4 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md dark:ring-white/8"
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
      </CardContent>
    </Card>
  </section>
</template>

<script setup lang="ts">
import { ShoppingCart, SlidersHorizontal } from 'lucide-vue-next'
import { computed } from 'vue'

import ProductImageCarousel from '@/components/merch/ProductImageCarousel.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import Input from '@/components/ui/Input.vue'
import type { MerchCopy } from '@/config/merch-copy'
import type { Product, StoreLocale } from '@/types/merch'

const props = defineProps<{
  t: MerchCopy
  locale: StoreLocale
  search: string
  filteredProducts: Product[]
  formatCurrency: Intl.NumberFormat
}>()

const emit = defineEmits<{
  'search-change': [value: string]
  'open-product': [productId: string]
  'quick-add': [productId: string]
}>()

const searchValue = computed({
  get: () => props.search,
  set: (value: string) => emit('search-change', value),
})
</script>
