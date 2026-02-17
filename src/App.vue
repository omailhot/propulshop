<template>
  <Header :title="t.appTitle" :subtitle="t.appSubtitle" />

  <main class="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_14%_6%,rgba(255,160,0,0.23),transparent_34%),radial-gradient(circle_at_75%_0%,rgba(255,0,53,0.16),transparent_35%)] pb-6">
    <div class="mx-auto max-w-[96rem] px-4 py-6 sm:px-6">
      <div class="mt-5" v-if="currentView === 'catalog'">
        <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <CatalogSection
          :t="t"
          :locale="locale"
          :search="state.search.value"
          :filtered-products="filteredProducts"
          :format-currency="formatCurrency"
          @search-change="actions.setSearch"
          @open-product="actions.setActiveProductId"
          @quick-add="onQuickAdd"
        />
        <CartSidebar
          :t="t"
          :locale="locale"
          :cart-lines="derived.cartLines.value"
          :subtotal="derived.subtotal.value"
          :credit-used="derived.creditUsed.value"
          :credit-remaining="derived.creditRemaining.value"
          :wallet-to-pay="derived.walletToPay.value"
          :format-currency="formatCurrency"
          @reset-cart="actions.resetCart"
          @remove-item="actions.removeCartItem"
          @update-item-quantity="actions.updateCartItemQuantity"
          @continue-checkout="onContinueCheckout"
        />
        </div>
      </div>
      <OrderConfirmationPage
        v-else
        :t="t"
        :locale="locale"
        :cart-lines="derived.cartLines.value"
        :subtotal="derived.subtotal.value"
        :credit-used="derived.creditUsed.value"
        :credit-remaining="derived.creditRemaining.value"
        :wallet-to-pay="derived.walletToPay.value"
        :format-currency="formatCurrency"
        :is-submitting="isSubmittingOrder"
        @back="onBackToCatalog"
        @place-order="submitOrder"
      />
    </div>
  </main>

  <ProductDetailsModal
    :t="t"
    :locale="locale"
    :product="derived.activeProduct.value"
    :open="Boolean(state.activeProductId.value)"
    :format-currency="formatCurrency"
    @close="actions.setActiveProductId(null)"
    @add-to-cart="onAddToCart"
  />

  <ToastStack :toasts="state.toastQueue.value" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import Header from '@/components/Header.vue'
import CartSidebar from '@/components/merch/CartSidebar.vue'
import CatalogSection from '@/components/merch/CatalogSection.vue'
import OrderConfirmationPage from '@/components/merch/OrderConfirmationPage.vue'
import ProductDetailsModal from '@/components/merch/ProductDetailsModal.vue'
import ToastStack from '@/components/merch/ToastStack.vue'
import { merchCopy } from '@/config/merch-copy'
import { products } from '@/config/merch-store'
import { useMerchStore } from '@/hooks/use-merch-store'
import { getLocale } from '@/paraglide/runtime'
import type { StoreLocale } from '@/types/merch'

const locale = computed<StoreLocale>(() => (getLocale() === 'fr' ? 'fr' : 'en'))
const t = computed(() => merchCopy[locale.value])

const formatCurrency = computed(
  () =>
    new Intl.NumberFormat(locale.value === 'fr' ? 'fr-CA' : 'en-CA', {
      style: 'currency',
      currency: 'CAD',
    }),
)

const { state, derived, actions } = useMerchStore(products)
const currentView = ref<'catalog' | 'confirmation'>('catalog')
const isSubmittingOrder = ref(false)

const filteredProducts = computed(() => {
  const query = state.search.value.trim().toLowerCase()

  return products.filter((product) => {
    const searchableText = `${product.name[locale.value]} ${product.description[locale.value]}`.toLowerCase()
    return query.length === 0 || searchableText.includes(query)
  })
})

const onQuickAdd = (productId: string) => {
  const product = products.find((item) => item.id === productId)
  if (!product) {
    return
  }

  if ((product.variantGroups ?? []).length > 0) {
    actions.setActiveProductId(productId)
    return
  }

  actions.quickAdd(productId)
  actions.enqueueToast(t.value.addedToCart)
}

const onAddToCart = (input: { productId: string; selectedOptions: Record<string, string>; quantity: number }) => {
  actions.addToCart(input.productId, input.selectedOptions, input.quantity)
  actions.enqueueToast(t.value.addedToCart)
}

const onContinueCheckout = () => {
  if (derived.cartLines.value.length === 0) {
    return
  }

  currentView.value = 'confirmation'
}

const onBackToCatalog = () => {
  currentView.value = 'catalog'
}

type OrderPayload = {
  requestId: string
  submittedAt: string
  locale: StoreLocale
  itemCount: number
  itemsSummary: string
  items: Array<{
    id: string
    productId: string
    productName: string
    quantity: number
    unitPrice: number
    lineTotal: number
    selectedOptions: Record<string, string>
  }>
  totals: {
    subtotal: number
    creditUsed: number
    creditRemaining: number
    walletToPay: number
  }
}

const getOrderPayload = (): OrderPayload => ({
  requestId: crypto.randomUUID(),
  submittedAt: new Date().toISOString(),
  locale: locale.value,
  itemCount: derived.itemCount.value,
  itemsSummary: derived.cartLines.value
    .map((line) => {
      const selected = Object.entries(line.selectedOptions)
        .map(([key, value]) => `${key}=${value}`)
        .join(', ')
      const selectedText = selected.length > 0 ? ` (${selected})` : ''
      return `${line.product.name[locale.value]} x${line.quantity}${selectedText}`
    })
    .join(' | '),
  items: derived.cartLines.value.map((line) => ({
    id: line.id,
    productId: line.productId,
    productName: line.product.name[locale.value],
    quantity: line.quantity,
    unitPrice: line.product.price,
    lineTotal: line.lineTotal,
    selectedOptions: line.selectedOptions,
  })),
  totals: {
    subtotal: derived.subtotal.value,
    creditUsed: derived.creditUsed.value,
    creditRemaining: derived.creditRemaining.value,
    walletToPay: derived.walletToPay.value,
  },
})

const submitOrder = async () => {
  if (derived.cartLines.value.length === 0 || isSubmittingOrder.value) {
    return
  }

  isSubmittingOrder.value = true
  const payload = getOrderPayload()

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    })

    if (response.status === 401) {
      actions.enqueueToast(t.value.orderAuthRequired)
      return
    }

    if (!response.ok) {
      throw new Error(`Order API failed with status ${response.status}`)
    }

    actions.enqueueToast(t.value.orderSent)
    actions.resetCart()
    currentView.value = 'catalog'
  } catch (error) {
    console.error(error)
    actions.enqueueToast(t.value.orderSendFailed)
  } finally {
    isSubmittingOrder.value = false
  }
}
</script>
