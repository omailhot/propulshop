<template>
  <Header
    :title="t.appTitle"
    :subtitle="t.appSubtitle"
    :session-email="sessionUser?.email ?? null"
    :is-authenticated="Boolean(sessionUser)"
    :is-admin="isAdmin"
    :view="currentView"
    :auth-busy="authBusy"
    :connect-google-label="t.connectGoogle"
    :connecting-label="t.connecting"
    :sign-in-label="t.signIn"
    :sign-out-label="t.logout"
    :admin-label="t.admin"
    :catalog-label="t.backToCatalogShort"
    :show-credit="currentView === 'catalog' && !isReadOnlyForCurrentUser"
    :credit-label="t.creditRemainingShort"
    :credit-remaining-label="
      CREDIT_IS_SET
        ? formatCurrency.format(derived.creditRemaining.value)
        : t.toBeDetermined
    "
    @connect-google="onConnectGoogle"
    @sign-out="onSignOut"
    @open-admin="onOpenAdmin"
    @open-catalog="currentView = 'catalog'"
    @open-home="onBackToCatalog"
  />

  <!--
    Avis de connexion: une barre pleine largeur, tout en haut, avant
    l'accueil. C'est la première chose à faire, donc la première chose lue.
  -->
  <div
    v-if="currentView === 'catalog' && !sessionUser && !authBusy"
    class="bg-card border-b"
    role="region"
    :aria-label="t.loggedOutBannerTitle"
  >
    <div
      class="mx-auto flex max-w-6xl flex-col items-start gap-2.5 py-3 pr-32 pl-4 sm:flex-row sm:items-center sm:gap-5 sm:pr-64 sm:pl-8 lg:pr-[22rem]"
    >
      <p class="text-foreground text-sm leading-snug">
        <span class="font-semibold">{{ t.loggedOutBannerTitle }}.</span>
        <span class="ml-1 hidden sm:inline">{{ t.loggedOutBannerBody }}</span>
      </p>
      <Button
        variant="outline"
        size="sm"
        class="shrink-0"
        @click="onConnectGoogle"
      >
        {{ t.connectGoogle }}
      </Button>
    </div>
  </div>

  <!-- Le fond: grège, sans dégradé. Le dégradé ne sert jamais de fond de page. -->
  <main class="min-h-[calc(100vh-4rem)] overflow-x-clip pb-16">
    <div class="mx-auto max-w-6xl min-w-0 px-4 py-6 sm:px-8 sm:py-10">
      <div v-if="currentView === 'admin'">
        <AdminDashboard
          :t="t"
          :is-view-only="isViewOnly"
          :loading="adminLoading"
          :error="adminError"
          :orders="adminOrders"
          :items-summary="adminItemsSummary"
          @refresh="loadAdminDashboard"
          @select-order="onOpenAdminOrder"
          @delete-order="onDeleteAdminOrder"
          @toggle-view-only="toggleViewOnly"
        />
      </div>
      <div
        v-else-if="currentView === 'catalog'"
        :class="{ 'lg:pr-80': !isReadOnlyForCurrentUser }"
      >
        <div
          v-if="isReadOnlyForCurrentUser"
          class="bg-ocre-pale mb-6 flex items-start gap-3 rounded-lg p-4"
          role="status"
        >
          <Lock class="text-ocre mt-0.5 size-4 shrink-0" />
          <div>
            <p class="font-semibold">{{ t.viewOnlyBannerTitle }}</p>
            <p class="mt-0.5 text-sm">{{ t.viewOnlyBannerBody }}</p>
          </div>
        </div>

        <div
          v-if="activeOrderConfirmedAt"
          class="mb-6 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex items-start gap-3">
            <span
              class="bg-vert-pale text-vert mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full"
              aria-hidden="true"
            >
              <Check class="size-4" />
            </span>
            <div>
              <p class="font-semibold">{{ t.existingOrderBannerTitle }}</p>
              <p class="text-muted-foreground mt-0.5 text-sm">
                {{ orderStatusMessage }}
              </p>
            </div>
          </div>
          <div class="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button
              v-if="!isReadOnlyForCurrentUser"
              variant="outline"
              :disabled="lockActionBusy"
              @click="onToggleOrderLock"
            >
              {{ t.unlockOrder }}
            </Button>
            <Button variant="outline" @click="onOpenDashboard">
              {{ t.viewMyOrder }}
            </Button>
          </div>
        </div>
        <!-- L'accueil: un titre et une ligne de faits. Rien d'autre. -->
        <section class="pb-8 sm:pb-10">
          <h1 class="t-h1">{{ t.welcomeTitle }}</h1>
          <dl
            class="text-muted-foreground mt-3 flex flex-wrap gap-x-8 gap-y-1 text-[15px]"
          >
            <div class="flex gap-2">
              <dt>{{ t.welcomeCreditLabel }}</dt>
              <dd class="t-num text-foreground font-semibold">
                {{ welcomeCredit ?? t.toBeDetermined }}
              </dd>
            </div>
            <div class="flex gap-2">
              <dt>{{ t.welcomeDeadlineLabel }}</dt>
              <dd class="t-num text-foreground font-semibold">
                {{ welcomeDeadline ?? t.toBeDetermined }}
              </dd>
            </div>
          </dl>
        </section>

        <CatalogSection
          :t="t"
          :locale="locale"
          :products="products"
          :cart-lines="derived.cartLines.value"
          :format-currency="formatCurrency"
          :view-only="isReadOnlyForCurrentUser"
          :active-category="state.activeCategory.value"
          @select-category="actions.setActiveCategory"
          @open-product="onOpenProduct"
          @quick-add="onQuickAdd"
        />
      </div>
      <OrderConfirmationPage
        v-else-if="currentView === 'confirmation'"
        :t="t"
        :locale="locale"
        :cart-lines="derived.cartLines.value"
        :subtotal="derived.subtotal.value"
        :credit-used="derived.creditUsed.value"
        :credit-remaining="derived.creditRemaining.value"
        :wallet-to-pay="derived.walletToPay.value"
        :format-currency="formatCurrency"
        :is-submitting="isSubmittingOrder"
        :lock-action-busy="lockActionBusy"
        :is-order-locked="activeOrderLocked"
        :is-lock-deadline-passed="isLockDeadlinePassed"
        :lock-deadline-label="lockDeadlineLabel"
        :order-status-message="orderStatusMessage"
        :view-only="isReadOnlyForCurrentUser"
        :is-placed="false"
        :back-label="t.backToCatalog"
        @back="onBackToCatalog"
        @remove-item="onRemoveCartItem"
        @update-item-quantity="onUpdateCartItemQuantity"
        @update-item-variants="onUpdateCartItemVariants"
        @place-order="submitOrder"
      />
      <OrderPlacedPage
        v-else-if="currentView === 'placed'"
        :t="t"
        :locale="locale"
        :cart-lines="placedOrderPreview.cartLines"
        :deadline-label="lockDeadlineLabel"
        :lock-action-busy="lockActionBusy"
        :view-only="isReadOnlyForCurrentUser"
        @back="onBackToCatalog"
        @unlock-and-back="onUnlockAndBackToCatalog"
      />
      <AdminOrderDetailsPage
        v-else
        :t="t"
        :locale="locale"
        :cart-lines="adminPreview.cartLines"
        :format-currency="formatCurrency"
        @back="onBackFromAdminOrder"
      />
    </div>
  </main>

  <ProductDetailsModal
    :t="t"
    :locale="locale"
    :product="derived.activeProduct.value"
    :open="Boolean(state.activeProductId.value)"
    :format-currency="formatCurrency"
    :read-only="!isOrderEditable || isReadOnlyForCurrentUser"
    :initial-options="activeProductInitialOptions"
    @close="actions.setActiveProductId(null)"
    @add-to-cart="onAddToCart"
  />

  <!-- Les avis vivent en bas, le panier en haut: ils ne se croisent jamais. -->
  <Toaster position="bottom-right" />

  <div
    v-if="showOverwriteModal"
    class="bg-encre/55 fixed inset-0 z-50 flex items-center justify-center px-4"
    @click.self="onCancelOverwriteModal"
  >
    <div
      class="bg-card relative w-full max-w-md rounded-lg border p-6 shadow-2xl"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        class="text-muted-foreground hover:text-foreground focus-visible:ring-ring/40 absolute top-3 right-3 cursor-pointer rounded-md p-1 transition-colors outline-none focus-visible:ring-[3px]"
        :aria-label="t.closeLabel"
        @click="onCancelOverwriteModal"
      >
        <X class="size-4" />
      </button>
      <h3 class="t-h3 pr-6 font-semibold">{{ t.orderPlacedStatus }}</h3>
      <p class="text-muted-foreground mt-2 text-sm">
        {{ t.existingOrderBannerTitle }}
      </p>
      <p class="text-muted-foreground mt-1 text-sm">
        {{ t.overwriteOrderPrompt }}
      </p>
      <div class="mt-5 grid gap-2 sm:grid-cols-2">
        <Button variant="outline" @click="onGoToExistingOrderFromModal">
          {{ t.viewMyOrder }}
        </Button>
        <Button variant="destructive" @click="onConfirmOverwriteOrder">
          {{ t.overwriteOrderAction }}
        </Button>
      </div>
    </div>
  </div>

  <!--
    Panier flottant, en haut à droite sous l'en-tête collant. Sur grand
    écran: un résumé complet (lignes, sous-total, crédit) dans une colonne
    réservée, pour ne rien couvrir. Ailleurs: une pastille compacte.
  -->
  <template
    v-if="
      currentView === 'catalog' &&
      !isReadOnlyForCurrentUser &&
      !state.cartOpen.value
    "
  >
    <button
      type="button"
      class="bg-encre text-grege focus-visible:ring-ring/50 fixed top-[4.25rem] right-4 z-30 flex h-12 cursor-pointer items-center gap-4 rounded-full px-5 shadow-lg transition-colors outline-none hover:bg-[#3a312a] focus-visible:ring-[3px] sm:top-20 sm:right-8 lg:hidden"
      :aria-label="t.openCart"
      @click="actions.setCartOpen(true)"
    >
      <span class="flex items-center gap-2.5 font-semibold">
        <ShoppingBag class="size-4" />
        <span class="hidden sm:inline">{{ t.cartBuilder }}</span>
        <span
          class="t-num bg-grege text-encre inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs"
        >
          {{ derived.itemCount.value }}
        </span>
      </span>
      <span class="t-num font-semibold">{{
        formatCurrency.format(derived.subtotal.value)
      }}</span>
    </button>

    <div
      class="pointer-events-none fixed inset-x-0 top-20 z-30 hidden lg:block"
    >
      <div class="mx-auto flex max-w-6xl justify-end px-8">
        <aside
          class="bg-card pointer-events-auto w-72 rounded-lg border p-5 shadow-lg"
          :aria-label="t.cartBuilder"
        >
          <div class="flex items-center justify-between">
            <h2 class="flex items-center gap-2 text-[15px] font-semibold">
              <ShoppingBag class="size-4" />
              {{ t.cartBuilder }}
            </h2>
            <span
              class="t-num bg-encre/8 inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold"
            >
              {{ derived.itemCount.value }}
            </span>
          </div>

          <p
            v-if="derived.cartLines.value.length === 0"
            class="text-muted-foreground mt-3 text-sm"
          >
            {{ t.emptyCart }}
          </p>
          <ul
            v-else
            class="mt-3 max-h-[30vh] space-y-2 overflow-y-auto text-sm"
          >
            <li
              v-for="line in derived.cartLines.value"
              :key="line.id"
              class="flex items-baseline justify-between gap-3"
            >
              <span class="min-w-0 truncate">
                <span class="t-num text-muted-foreground"
                  >{{ line.quantity }} ×</span
                >
                {{ line.product.name[locale] }}
              </span>
              <span class="t-num shrink-0">{{
                formatCurrency.format(line.lineTotal)
              }}</span>
            </li>
          </ul>

          <dl class="mt-4 space-y-1.5 border-t pt-4 text-sm">
            <div class="flex justify-between gap-3">
              <dt class="text-muted-foreground">{{ t.subtotal }}</dt>
              <dd class="t-num font-semibold">
                {{ formatCurrency.format(derived.subtotal.value) }}
              </dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-muted-foreground">
                {{ t.creditRemainingShort }}
              </dt>
              <dd class="t-num font-semibold">
                {{
                  CREDIT_IS_SET
                    ? formatCurrency.format(derived.creditRemaining.value)
                    : t.toBeDetermined
                }}
              </dd>
            </div>
            <div
              v-if="CREDIT_IS_SET && derived.walletToPay.value > 0"
              class="flex justify-between gap-3"
            >
              <dt class="text-muted-foreground">{{ t.walletToPay }}</dt>
              <dd class="t-num font-semibold">
                {{ formatCurrency.format(derived.walletToPay.value) }}
              </dd>
            </div>
          </dl>

          <button
            type="button"
            class="bg-encre text-grege focus-visible:ring-ring/50 mt-4 flex h-11 w-full cursor-pointer items-center justify-center rounded-md text-sm font-semibold transition-colors outline-none hover:bg-[#3a312a] focus-visible:ring-[3px]"
            @click="actions.setCartOpen(true)"
          >
            {{ t.openCart }}
          </button>
        </aside>
      </div>
    </div>
  </template>

  <CartDrawer
    :open="state.cartOpen.value"
    :t="t"
    :locale="locale"
    :cart-lines="derived.cartLines.value"
    :subtotal="derived.subtotal.value"
    :credit-used="derived.creditUsed.value"
    :credit-remaining="derived.creditRemaining.value"
    :wallet-to-pay="derived.walletToPay.value"
    :format-currency="formatCurrency"
    :read-only="!isOrderEditable || isReadOnlyForCurrentUser"
    @close="actions.setCartOpen(false)"
    @reset-cart="onResetCart"
    @remove-item="onRemoveCartItem"
    @update-item-quantity="onUpdateCartItemQuantity"
    @continue-checkout="onContinueCheckout"
  />
</template>

<script setup lang="ts">
import { Check, Lock, ShoppingBag, X } from "lucide-vue-next";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

import Header from "@/components/Header.vue";
import AdminDashboard from "@/components/merch/AdminDashboard.vue";
import AdminOrderDetailsPage from "@/components/merch/AdminOrderDetailsPage.vue";
import CartDrawer from "@/components/merch/CartDrawer.vue";
import CatalogSection from "@/components/merch/CatalogSection.vue";
import OrderConfirmationPage from "@/components/merch/OrderConfirmationPage.vue";
import OrderPlacedPage from "@/components/merch/OrderPlacedPage.vue";
import ProductDetailsModal from "@/components/merch/ProductDetailsModal.vue";
import Button from "@/components/ui/Button.vue";
import { Toaster } from "@/components/ui/sonner";
import { EDITION, formatCredit, formatDeadlineLong } from "@/config/edition";
import { merchCopy } from "@/config/merch-copy";
import {
  COMPANY_CREDIT,
  CREDIT_IS_SET,
  products,
} from "@/config/merch-store";
import type { SupplierId } from "@/config/suppliers";
import { useMerchStore } from "@/hooks/use-merch-store";
import {
  buildCartItemId,
  computeBillableByPerson,
  findProductByOrderProductId,
  GIFT_CARD_DEFAULT_AMOUNT,
  GIFT_CARD_MAX_AMOUNT,
  GIFT_CARD_MIN_AMOUNT,
  normalizeSelectedOptions,
  resolveOrderProductSelection,
  validateGiftCardAmount,
  withImpliedOptions,
} from "@/lib/merch-order";
import { neonClient } from "@/lib/neon-client";
import { formatVariantChips, getVariantChips } from "@/lib/variant-labels";
import type { CartLineView, StoreLocale } from "@/types/merch";

const locale = computed<StoreLocale>(() => "fr");
const t = computed(() => merchCopy[locale.value]);

const formatCurrency = computed(
  () =>
    new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }),
);

const { state, derived, actions } = useMerchStore(products);
const currentView = ref<
  "catalog" | "confirmation" | "placed" | "admin" | "admin-order"
>("catalog");
const VIEW_SESSION_KEY = "propulshop-current-view";
const GLOBAL_VIEW_ONLY_SETTING_KEY = "global_readonly_mode";
const VIEW_ONLY_CACHE_KEY = "propulshop-global-view-only";
const isSubmittingOrder = ref(false);
const showOverwriteModal = ref(false);
const lockActionBusy = ref(false);
const authBusy = ref(true);
const isViewOnly = ref(false);
const sessionUser = ref<SessionUser | null>(null);
const isAdmin = ref(false);
const adminUsers = ref<
  Array<{
    user_id: string;
    email: string;
    display_name: string;
    created_at: string;
    last_seen_at: string | null;
  }>
>([]);
const adminOrders = ref<
  Array<{
    id: string;
    user_name: string;
    user_email: string | null;
    item_count: number;
    total_per_person: number;
    billable_per_person: number;
    is_locked: boolean;
    created_at: string;
  }>
>([]);
const adminItemsSummary = ref<
  Array<{
    key: string;
    product_name: string;
    variants: string;
    total_quantity: number;
    order_count: number;
    supplier: SupplierId | null;
  }>
>([]);
const adminLoading = ref(false);
const adminError = ref<string | null>(null);
const activeOrderId = ref<string | null>(null);
const activeOrderLocked = ref(false);
const activeOrderPlacedAt = ref<string | null>(null);
const activeOrderConfirmedAt = ref<string | null>(null);
const activeOrderLockDeadlineAt = ref<string | null>(EDITION.orderDeadline);
const isPersistingDraft = ref(false);
const pendingCartAction = ref<null | (() => void)>(null);
const adminSelectedOrderId = ref<string | null>(null);
let adminRefreshTimer: number | null = null;
let viewOnlyRefreshTimer: number | null = null;
const placedOrderPreview = ref<{
  cartLines: CartLineView[];
  subtotal: number;
  creditUsed: number;
  creditRemaining: number;
  walletToPay: number;
}>({
  cartLines: [],
  subtotal: 0,
  creditUsed: 0,
  creditRemaining: 0,
  walletToPay: 0,
});
const adminPreview = ref<{
  cartLines: CartLineView[];
  subtotal: number;
  creditUsed: number;
  creditRemaining: number;
  walletToPay: number;
  isOrderLocked: boolean;
  isLockDeadlinePassed: boolean;
  lockDeadlineLabel: string;
  orderStatusMessage: string;
}>({
  cartLines: [],
  subtotal: 0,
  creditUsed: 0,
  creditRemaining: 0,
  walletToPay: 0,
  isOrderLocked: false,
  isLockDeadlinePassed: false,
  lockDeadlineLabel: "",
  orderStatusMessage: "",
});

// La sélection de départ de la fiche produit: la couleur choisie sur la carte.
const activeProductInitialOptions = ref<Record<string, string>>({});
const welcomeCredit = computed(() => formatCredit(locale.value));
const welcomeDeadline = computed(() => formatDeadlineLong(locale.value));

// `null` tant que la date limite est à déterminer.
const lockDeadlineDate = computed(() =>
  activeOrderLockDeadlineAt.value
    ? new Date(activeOrderLockDeadlineAt.value)
    : null,
);
const lockDeadlineLabel = computed(
  () =>
    lockDeadlineDate.value?.toLocaleString(
      locale.value === "fr" ? "fr-CA" : "en-CA",
      {
        dateStyle: "long",
        timeStyle: "short",
      },
    ) ?? t.value.toBeDetermined,
);
const isLockDeadlinePassed = computed(() =>
  lockDeadlineDate.value
    ? Date.now() >= lockDeadlineDate.value.getTime()
    : false,
);
// Le panier se remplit sans connexion; la connexion n'est exigée qu'au
// moment de confirmer la commande (voir requireSignIn).
const isOrderEditable = computed(() => true);
const isReadOnlyForCurrentUser = computed(
  () => isViewOnly.value,
);
const orderStatusMessage = computed(() => {
  if (!activeOrderConfirmedAt.value) {
    return t.value.orderNoDraftStatus;
  }
  return `${t.value.orderPlacedStatus} ${new Date(activeOrderConfirmedAt.value).toLocaleString(locale.value === "fr" ? "fr-CA" : "en-CA")}.`;
});

const buildOrderStatusMessage = (input: {
  activeOrderId: string | null;
  placedAt: string | null;
}) => {
  if (!input.activeOrderId) {
    return t.value.orderNoDraftStatus;
  }
  if (input.placedAt) {
    return `${t.value.orderPlacedStatus} ${new Date(input.placedAt).toLocaleString(locale.value === "fr" ? "fr-CA" : "en-CA")}.`;
  }
  return t.value.orderUnlockedStatus;
};

const toggleViewOnly = () => {
  if (!isAdmin.value) {
    return;
  }
  void persistGlobalViewOnlySetting(!isViewOnly.value);
};

const onOpenProduct = (
  productId: string,
  initialOptions: Record<string, string> = {},
) => {
  activeProductInitialOptions.value = initialOptions;
  actions.setActiveProductId(productId);
};

const onQuickAdd = (
  productId: string,
  initialOptions: Record<string, string> = {},
) => {
  if (isReadOnlyForCurrentUser.value) {
    return;
  }
  if (!ensureOrderEditable()) {
    return;
  }

  const product = products.find((item) => item.id === productId);
  if (!product) {
    return;
  }

  // La couleur vient de la pastille de la carte. Toute autre option
  // (taille, visuel) se choisit dans la fiche produit.
  const groups = product.variantGroups ?? [];
  if (groups.some((group) => group.type !== "color")) {
    onOpenProduct(productId, initialOptions);
    return;
  }

  const selectedOptions = Object.fromEntries(
    groups.map((group) => {
      const preset = initialOptions[group.id];
      const hasPreset = group.options.some((option) => option.id === preset);
      return [group.id, hasPreset ? preset : (group.options[0]?.id ?? "")];
    }),
  );

  runCartActionOrPromptOverwrite(() => {
    actions.addToCart(productId, normalizeSelectedOptions(selectedOptions), 1);
    actions.enqueueToast(t.value.addedToCart);
    void persistCartDraft();
  });
};

const onAddToCart = (input: {
  productId: string;
  selectedOptions: Record<string, string>;
  quantity: number;
}) => {
  if (isReadOnlyForCurrentUser.value) {
    return;
  }
  if (!ensureOrderEditable()) {
    return;
  }
  if (input.productId === "gift-card") {
    const rawAmount = Number(
      input.selectedOptions.amount ?? GIFT_CARD_DEFAULT_AMOUNT,
    );
    if (
      !validateGiftCardAmount(
        rawAmount,
        GIFT_CARD_MIN_AMOUNT,
        GIFT_CARD_MAX_AMOUNT,
      )
    ) {
      actions.enqueueToast(t.value.giftCardOutOfRange);
      return;
    }
  }
  runCartActionOrPromptOverwrite(() => {
    actions.addToCart(
      input.productId,
      normalizeSelectedOptions(input.selectedOptions),
      input.quantity,
    );
    actions.enqueueToast(t.value.addedToCart);
    void persistCartDraft();
  });
};

const onResetCart = () => {
  if (isReadOnlyForCurrentUser.value) {
    return;
  }
  if (!ensureOrderEditable()) {
    return;
  }
  actions.resetCart();
  void persistCartDraft();
};

const onRemoveCartItem = (cartItemId: string) => {
  if (isReadOnlyForCurrentUser.value) {
    return;
  }
  if (!ensureOrderEditable()) {
    return;
  }
  actions.removeCartItem(cartItemId);
  void persistCartDraft();
};

const onUpdateCartItemQuantity = (cartItemId: string, nextQuantity: number) => {
  if (isReadOnlyForCurrentUser.value) {
    return;
  }
  if (!ensureOrderEditable()) {
    return;
  }
  actions.updateCartItemQuantity(cartItemId, nextQuantity);
  void persistCartDraft();
};

const onUpdateCartItemVariants = (
  cartItemId: string,
  nextSelectedOptions: Record<string, string>,
) => {
  if (isReadOnlyForCurrentUser.value) {
    return;
  }
  if (!ensureOrderEditable()) {
    return;
  }
  actions.updateCartItemVariants(
    cartItemId,
    normalizeSelectedOptions(nextSelectedOptions),
  );
  void persistCartDraft();
};

const onContinueCheckout = () => {
  if (derived.cartLines.value.length === 0) {
    return;
  }
  if (!requireSignIn()) {
    return;
  }

  actions.setCartOpen(false);
  currentView.value = "confirmation";
};

const onBackToCatalog = () => {
  currentView.value = "catalog";
};

const onUnlockAndBackToCatalog = async () => {
  await onToggleOrderLock();
  currentView.value = "catalog";
};

const onOpenDashboard = () => {
  currentView.value = activeOrderConfirmedAt.value ? "placed" : "confirmation";
};

const runCartActionOrPromptOverwrite = (action: () => void) => {
  if (activeOrderConfirmedAt.value) {
    pendingCartAction.value = action;
    showOverwriteModal.value = true;
    return;
  }
  action();
};

const onConfirmOverwriteOrder = () => {
  showOverwriteModal.value = false;
  activeOrderConfirmedAt.value = null;
  activeOrderPlacedAt.value = null;
  placedOrderPreview.value = {
    cartLines: [],
    subtotal: 0,
    creditUsed: 0,
    creditRemaining: 0,
    walletToPay: 0,
  };
  const action = pendingCartAction.value;
  pendingCartAction.value = null;
  action?.();
};

const onGoToExistingOrderFromModal = () => {
  showOverwriteModal.value = false;
  pendingCartAction.value = null;
  currentView.value = "placed";
};

const onCancelOverwriteModal = () => {
  showOverwriteModal.value = false;
  pendingCartAction.value = null;
};

const onToggleOrderLock = async () => {
  if (isReadOnlyForCurrentUser.value) {
    return;
  }
  if (!sessionUser.value || lockActionBusy.value) {
    return;
  }

  if (!activeOrderConfirmedAt.value) {
    await submitOrder();
    return;
  }

  if (!activeOrderId.value) {
    return;
  }

  lockActionBusy.value = true;
  try {
    const orderResult = await neonClient
      .from("orders")
      .select("raw_payload")
      .eq("id", activeOrderId.value)
      .eq("user_id", sessionUser.value.id)
      .single();
    if (orderResult.error) {
      throw orderResult.error;
    }

    const currentRawPayload = (
      orderResult.data as { raw_payload?: unknown } | null
    )?.raw_payload;
    const nextRawPayload =
      currentRawPayload && typeof currentRawPayload === "object"
        ? {
            ...(currentRawPayload as Record<string, unknown>),
            confirmedAt: null,
          }
        : { confirmedAt: null };

    const updateOrder = await neonClient
      .from("orders")
      .update({
        submitted_at: new Date().toISOString(),
        is_locked: false,
        locked_at: null,
        raw_payload: nextRawPayload,
      })
      .eq("id", activeOrderId.value)
      .eq("user_id", sessionUser.value.id);
    if (updateOrder.error) {
      throw updateOrder.error;
    }

    activeOrderConfirmedAt.value = null;
    await loadCurrentUserOrder();
    actions.setCartOpen(false);
    actions.enqueueToast(t.value.reopenOrder);
  } catch (error) {
    console.error(error);
    actions.enqueueToast(t.value.orderSendFailed);
  } finally {
    lockActionBusy.value = false;
  }
};

const onBackFromAdminOrder = () => {
  currentView.value = "admin";
};

const onOpenAdminOrder = async (orderId: string) => {
  if (!isAdmin.value) {
    return;
  }

  const orderResult = await neonClient
    .from("orders")
    .select(
      "id,subtotal,credit_used,credit_remaining,wallet_to_pay,raw_payload",
    )
    .eq("id", orderId)
    .single();
  if (orderResult.error || !orderResult.data) {
    actions.enqueueToast(t.value.orderSendFailed);
    return;
  }

  const labelsByCartLineId = new Map<string, Record<string, string>>();
  const rawPayload = (orderResult.data as { raw_payload?: unknown })
    .raw_payload;
  if (rawPayload && typeof rawPayload === "object") {
    const payloadItems = (rawPayload as Record<string, unknown>).items;
    if (Array.isArray(payloadItems)) {
      for (const item of payloadItems) {
        if (!item || typeof item !== "object") {
          continue;
        }
        const casted = item as Record<string, unknown>;
        const id = typeof casted.id === "string" ? casted.id : null;
        const labels =
          casted.selectedOptionLabels &&
          typeof casted.selectedOptionLabels === "object"
            ? (casted.selectedOptionLabels as Record<string, string>)
            : null;
        if (!id || !labels) {
          continue;
        }
        labelsByCartLineId.set(id, labels);
      }
    }
  }

  const itemsResult = await neonClient
    .from("order_items")
    .select(
      "id,cart_line_id,product_id,product_name,quantity,line_total,selected_options",
    )
    .eq("order_id", orderId);
  if (itemsResult.error) {
    actions.enqueueToast(t.value.orderSendFailed);
    return;
  }

  adminSelectedOrderId.value = orderId;
  adminPreview.value = {
    cartLines: (
      (itemsResult.data ?? []) as Array<{
        id: string;
        cart_line_id: string;
        product_id: string;
        product_name: string;
        quantity: number;
        line_total: number;
        selected_options: Record<string, string> | null;
      }>
    ).map((item) => {
      const storedOptions = normalizeSelectedOptions(
        (item.selected_options ?? {}) as Record<string, string>,
      );
      const product = findProductByOrderProductId(
        products,
        item.product_id,
        storedOptions,
      );
      const selectedOptions = withImpliedOptions(
        product,
        item.product_id,
        storedOptions,
      );
      return {
        id: item.id,
        quantity: item.quantity,
        lineTotal: Number(item.line_total),
        selectedOptions,
        selectedOptionLabels: labelsByCartLineId.get(item.cart_line_id),
        product: {
          id: product?.id,
          name: product?.name ?? {
            en: item.product_name,
            fr: item.product_name,
          },
          supplier: product?.supplier ?? null,
          images: product?.images,
          imageGallery: product?.imageGallery,
          variantGroups: product?.variantGroups,
        },
      };
    }),
    subtotal: Number(
      (orderResult.data as { subtotal: string | number }).subtotal,
    ),
    creditUsed: Number(
      (orderResult.data as { credit_used: string | number }).credit_used,
    ),
    creditRemaining: Number(
      (orderResult.data as { credit_remaining: string | number })
        .credit_remaining,
    ),
    walletToPay: Number(
      (orderResult.data as { wallet_to_pay: string | number }).wallet_to_pay,
    ),
    isOrderLocked: false,
    isLockDeadlinePassed: false,
    lockDeadlineLabel: "",
    orderStatusMessage: buildOrderStatusMessage({
      activeOrderId: orderId,
      placedAt: null,
    }),
  };

  currentView.value = "admin-order";
};

const onDeleteAdminOrder = async (orderId: string) => {
  if (!isAdmin.value) {
    return;
  }

  try {
    const deleteOrder = await neonClient
      .from("orders")
      .delete()
      .eq("id", orderId);
    if (deleteOrder.error) {
      throw deleteOrder.error;
    }

    if (adminSelectedOrderId.value === orderId) {
      adminSelectedOrderId.value = null;
      currentView.value = "admin";
    }
    if (activeOrderId.value === orderId) {
      await loadCurrentUserOrder();
    }
    await loadAdminDashboard();
    actions.enqueueToast("Commande supprimée avec succès.");
  } catch (error) {
    console.error(error);
    actions.enqueueToast(t.value.orderSendFailed);
  }
};

type OrderPayload = {
  requestId: string;
  submittedAt: string;
  locale: StoreLocale;
  itemCount: number;
  itemsSummary: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    selectedOptions: Record<string, string>;
    selectedOptionLabels: Record<string, string>;
  }>;
  totals: {
    subtotal: number;
    creditUsed: number;
    creditRemaining: number;
    walletToPay: number;
  };
};

const getOrderPayload = (): OrderPayload => ({
  requestId: crypto.randomUUID(),
  submittedAt: new Date().toISOString(),
  locale: locale.value,
  itemCount: derived.itemCount.value,
  itemsSummary: derived.cartLines.value
    .map((line) => {
      const selected = Object.entries(
        normalizeSelectedOptions(line.selectedOptions),
      )
        .map(([key, value]) => `${key}=${value}`)
        .join(", ");
      const selectedText = selected.length > 0 ? ` (${selected})` : "";
      return `${line.product.name[locale.value]} x${line.quantity}${selectedText}`;
    })
    .join(" | "),
  items: derived.cartLines.value.map((line) => {
    const selectedOptions = normalizeSelectedOptions(line.selectedOptions);
    const orderSelection = resolveOrderProductSelection(
      line.product,
      selectedOptions,
    );
    return {
      id: buildCartItemId(line.productId, selectedOptions),
      productId: orderSelection.orderProductId,
      productName: line.product.name[locale.value],
      quantity: line.quantity,
      unitPrice: orderSelection.unitPrice,
      lineTotal: orderSelection.unitPrice * line.quantity,
      selectedOptions,
      selectedOptionLabels: Object.fromEntries(
        (line.product.variantGroups ?? [])
          .map((group) => {
            const selectedOption = group.options.find(
              (option) => option.id === line.selectedOptions[group.id],
            );
            if (!selectedOption) {
              return null;
            }
            return [
              group.label[locale.value],
              selectedOption.label[locale.value],
            ] as const;
          })
          .filter(
            (value): value is readonly [string, string] =>
              Array.isArray(value) && value.length === 2,
          ),
      ),
    };
  }),
  totals: {
    subtotal: derived.subtotal.value,
    creditUsed: derived.creditUsed.value,
    creditRemaining: derived.creditRemaining.value,
    walletToPay: derived.walletToPay.value,
  },
});

const persistCartDraft = async (
  showErrorToast = false,
  confirmSelection = false,
) => {
  if (!sessionUser.value || isPersistingDraft.value) {
    return false;
  }

  isPersistingDraft.value = true;
  try {
    if (derived.cartLines.value.length === 0) {
      if (!activeOrderId.value) {
        return true;
      }

      const deleteOrder = await neonClient
        .from("orders")
        .delete()
        .eq("id", activeOrderId.value)
        .eq("user_id", sessionUser.value.id);
      if (deleteOrder.error) {
        throw deleteOrder.error;
      }

      activeOrderId.value = null;
      activeOrderLocked.value = false;
      activeOrderPlacedAt.value = null;
      activeOrderConfirmedAt.value = null;
      return true;
    }

    const payload = getOrderPayload();
    const confirmedAt = confirmSelection ? new Date().toISOString() : null;
    const shouldLockAfterItems = confirmSelection;
    const persistedPayload = {
      ...payload,
      confirmedAt,
    };
    let orderId = activeOrderId.value;

    if (!orderId) {
      const insertOrder = await neonClient
        .from("orders")
        .insert({
          id: crypto.randomUUID(),
          request_id: payload.requestId,
          submitted_at: payload.submittedAt,
          user_id: sessionUser.value.id,
          user_email: sessionUser.value.email,
          locale: payload.locale,
          item_count: payload.itemCount,
          items_summary: payload.itemsSummary,
          subtotal: payload.totals.subtotal,
          credit_used: payload.totals.creditUsed,
          credit_remaining: payload.totals.creditRemaining,
          wallet_to_pay: payload.totals.walletToPay,
          is_locked: false,
          locked_at: null,
          raw_payload: persistedPayload,
        })
        .select("id")
        .single();

      if (insertOrder.error) {
        throw insertOrder.error;
      }

      orderId = (insertOrder.data as { id: string }).id;
      activeOrderId.value = orderId;
    } else {
      const updateOrder = await neonClient
        .from("orders")
        .update({
          submitted_at: payload.submittedAt,
          user_email: sessionUser.value.email,
          locale: payload.locale,
          item_count: payload.itemCount,
          items_summary: payload.itemsSummary,
          subtotal: payload.totals.subtotal,
          credit_used: payload.totals.creditUsed,
          credit_remaining: payload.totals.creditRemaining,
          wallet_to_pay: payload.totals.walletToPay,
          is_locked: false,
          locked_at: null,
          raw_payload: persistedPayload,
        })
        .eq("id", orderId)
        .eq("user_id", sessionUser.value.id);
      if (updateOrder.error) {
        throw updateOrder.error;
      }
    }

    const deleteItems = await neonClient
      .from("order_items")
      .delete()
      .eq("order_id", orderId);
    if (deleteItems.error) {
      throw deleteItems.error;
    }

    const insertItems = await neonClient.from("order_items").insert(
      payload.items.map((item) => ({
        id: crypto.randomUUID(),
        order_id: orderId,
        cart_line_id: item.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        line_total: item.lineTotal,
        selected_options: item.selectedOptions,
      })),
    );
    if (insertItems.error) {
      throw insertItems.error;
    }

    if (shouldLockAfterItems) {
      const lockOrder = await neonClient
        .from("orders")
        .update({
          is_locked: true,
          locked_at: confirmedAt,
          raw_payload: persistedPayload,
        })
        .eq("id", orderId)
        .eq("user_id", sessionUser.value.id);
      if (lockOrder.error) {
        throw lockOrder.error;
      }
    }

    activeOrderConfirmedAt.value = confirmedAt;
    return true;
  } catch (error) {
    console.error(error);
    if (showErrorToast) {
      actions.enqueueToast(t.value.orderSendFailed);
    }
    return false;
  } finally {
    isPersistingDraft.value = false;
  }
};

type SessionUser = {
  id: string;
  email: string | null;
  isAdminClaim: boolean;
};

type PostgrestErrorLike = {
  code?: string;
  message?: string;
};

const missingTableWarnings = new Set<string>();

const isMissingTableError = (error: unknown, tableName: string) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const casted = error as PostgrestErrorLike;
  return (
    casted.code === "PGRST205" &&
    typeof casted.message === "string" &&
    casted.message.includes(`public.${tableName}`)
  );
};

const isPermissionDeniedError = (error: unknown, tableName: string) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const casted = error as PostgrestErrorLike;
  return (
    casted.code === "42501" &&
    typeof casted.message === "string" &&
    casted.message.toLowerCase().includes(`table ${tableName}`.toLowerCase())
  );
};

const isPolicyRecursionError = (error: unknown, tableName: string) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const casted = error as PostgrestErrorLike;
  return (
    casted.code === "42P17" &&
    typeof casted.message === "string" &&
    casted.message
      .toLowerCase()
      .includes(`relation "${tableName}"`.toLowerCase())
  );
};

const warnMissingTableOnce = (tableName: string) => {
  if (missingTableWarnings.has(tableName)) {
    return;
  }
  missingTableWarnings.add(tableName);
  console.warn(
    `Table public.${tableName} manquante. Exécutez database/neon-schema.sql.`,
  );
};

const warnPolicyRecursionOnce = (tableName: string) => {
  const key = `policy-recursion:${tableName}`;
  if (missingTableWarnings.has(key)) {
    return;
  }
  missingTableWarnings.add(key);
  console.warn(
    `RLS policy recursion detected on ${tableName}. Fix policy in database/neon-schema.sql (drop/recreate admin_users_select).`,
  );
};

const parseViewOnlySetting = (value: unknown) => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const casted = value as Record<string, unknown>;
  return casted.enabled === true;
};

const loadGlobalViewOnlySetting = async () => {
  const result = await neonClient
    .from("app_settings")
    .select("value_json")
    .eq("setting_key", GLOBAL_VIEW_ONLY_SETTING_KEY)
    .maybeSingle();

  if (result.error) {
    if (isMissingTableError(result.error, "app_settings")) {
      warnMissingTableOnce("app_settings");
      isViewOnly.value = false;
      return false;
    }
    if (isPermissionDeniedError(result.error, "app_settings")) {
      console.warn("Permission base de données manquante pour app_settings.");
      return isViewOnly.value;
    }
    throw result.error;
  }

  isViewOnly.value = parseViewOnlySetting(
    (result.data as { value_json?: unknown } | null)?.value_json,
  );
  return isViewOnly.value;
};

const persistGlobalViewOnlySetting = async (nextValue: boolean) => {
  if (!isAdmin.value) {
    return;
  }

  const payload = {
    setting_key: GLOBAL_VIEW_ONLY_SETTING_KEY,
    value_json: { enabled: nextValue },
    updated_at: new Date().toISOString(),
  };

  const updateResult = await neonClient
    .from("app_settings")
    .update({
      value_json: payload.value_json,
      updated_at: payload.updated_at,
    })
    .eq("setting_key", GLOBAL_VIEW_ONLY_SETTING_KEY)
    .select("setting_key")
    .maybeSingle();

  if (updateResult.error) {
    if (isMissingTableError(updateResult.error, "app_settings")) {
      warnMissingTableOnce("app_settings");
      actions.enqueueToast(
        "La table app_settings est manquante. Exécutez database/neon-schema.sql.",
      );
      return;
    }
    if (isPermissionDeniedError(updateResult.error, "app_settings")) {
      actions.enqueueToast(
        "Permission base de données manquante pour app_settings.",
      );
      return;
    }
    console.error(updateResult.error);
    actions.enqueueToast(t.value.orderSendFailed);
    return;
  }

  if (!updateResult.data) {
    const insertResult = await neonClient.from("app_settings").insert(payload);
    if (insertResult.error) {
      if (isMissingTableError(insertResult.error, "app_settings")) {
        warnMissingTableOnce("app_settings");
        actions.enqueueToast(
          "La table app_settings est manquante. Exécutez database/neon-schema.sql.",
        );
        return;
      }
      if (isPermissionDeniedError(insertResult.error, "app_settings")) {
        actions.enqueueToast(
          "Permission base de données manquante pour app_settings.",
        );
        return;
      }
      console.error(insertResult.error);
      actions.enqueueToast(t.value.orderSendFailed);
      return;
    }
  }

  isViewOnly.value = nextValue;
};

const getDisplayNameFromEmail = (email: string | null, fallbackId: string) => {
  if (!email) {
    return fallbackId.slice(0, 8);
  }

  const prefix = email.split("@")[0]?.trim();
  if (!prefix) {
    return fallbackId.slice(0, 8);
  }

  return prefix;
};

const getSessionUser = (sessionPayload: unknown): SessionUser | null => {
  if (!sessionPayload || typeof sessionPayload !== "object") {
    return null;
  }

  const direct = sessionPayload as Record<string, unknown>;
  const source =
    direct.data && typeof direct.data === "object"
      ? (direct.data as Record<string, unknown>)
      : direct;
  const session =
    source.session && typeof source.session === "object"
      ? (source.session as Record<string, unknown>)
      : null;
  const user = source.user ?? session?.user;

  if (!user || typeof user !== "object") {
    return null;
  }

  const casted = user as Record<string, unknown>;
  const id = typeof casted.id === "string" ? casted.id : null;
  const email = typeof casted.email === "string" ? casted.email : null;
  const role =
    typeof casted.role === "string" ? casted.role.toLowerCase() : null;
  const roles = Array.isArray(casted.roles)
    ? casted.roles
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.toLowerCase())
    : [];
  const metadata = casted.app_metadata;
  const metadataRole =
    metadata &&
    typeof metadata === "object" &&
    typeof (metadata as Record<string, unknown>).role === "string"
      ? ((metadata as Record<string, unknown>).role as string).toLowerCase()
      : null;
  const isAdminClaim =
    role === "admin" || roles.includes("admin") || metadataRole === "admin";

  if (!id) {
    return null;
  }

  return { id, email, isAdminClaim };
};

const ensureUserProfile = async (user: SessionUser) => {
  const upsert = await neonClient.from("app_users").upsert(
    {
      user_id: user.id,
      email: user.email ?? `${user.id}@unknown.local`,
      display_name: getDisplayNameFromEmail(user.email, user.id),
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (upsert.error) {
    if (isMissingTableError(upsert.error, "app_users")) {
      warnMissingTableOnce("app_users");
      return;
    }
    if (isPolicyRecursionError(upsert.error, "admin_users")) {
      warnPolicyRecursionOnce("admin_users");
      return;
    }
    throw upsert.error;
  }
};

const refreshSession = async () => {
  const payload = await neonClient.auth.getSession();
  const user = getSessionUser(payload);
  sessionUser.value = user;

  if (!user) {
    isAdmin.value = false;
    activeOrderId.value = null;
    activeOrderLocked.value = false;
    activeOrderPlacedAt.value = null;
    activeOrderConfirmedAt.value = null;
    return;
  }

  await ensureUserProfile(user);

  const adminCheck = await neonClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .limit(1);
  if (adminCheck.error) {
    if (isPolicyRecursionError(adminCheck.error, "admin_users")) {
      warnPolicyRecursionOnce("admin_users");
      isAdmin.value = false;
      return;
    }
    if (isMissingTableError(adminCheck.error, "admin_users")) {
      warnMissingTableOnce("admin_users");
    } else {
      console.error(adminCheck.error);
    }
    isAdmin.value = false;
    return;
  }

  const hasAdminRow = (adminCheck.data?.length ?? 0) > 0;
  isAdmin.value = hasAdminRow;
  if (user.isAdminClaim && !hasAdminRow) {
    actions.enqueueToast(
      "Droit admin détecté, mais le mapping admin_users est manquant.",
    );
  }
};

const loadCurrentUserOrder = async (keepLocalCart = false) => {
  if (!sessionUser.value) {
    return;
  }

  const orderResult = await neonClient
    .from("orders")
    .select("id,raw_payload,is_locked,locked_at")
    .eq("user_id", sessionUser.value.id)
    .limit(1);

  if (orderResult.error) {
    throw orderResult.error;
  }

  const order =
    (orderResult.data?.[0] as
      | { id: string; is_locked: boolean; locked_at: string | null }
      | undefined) ?? null;

  if (!order) {
    activeOrderId.value = null;
    activeOrderLocked.value = false;
    activeOrderPlacedAt.value = null;
    activeOrderConfirmedAt.value = null;
    activeOrderLockDeadlineAt.value = EDITION.orderDeadline;
    placedOrderPreview.value = {
      cartLines: [],
      subtotal: 0,
      creditUsed: 0,
      creditRemaining: 0,
      walletToPay: 0,
    };
    // Premier chargement après la connexion: un panier rempli avant de se
    // connecter devient le brouillon de la commande.
    if (keepLocalCart && derived.cartLines.value.length > 0) {
      void persistCartDraft();
    } else {
      actions.replaceCart([]);
    }
    return;
  }

  activeOrderId.value = order.id;
  activeOrderLocked.value = order.is_locked;
  activeOrderPlacedAt.value = null;
  const rawPayload = (
    orderResult.data?.[0] as { raw_payload?: unknown } | undefined
  )?.raw_payload;
  const labelsByCartLineId = new Map<string, Record<string, string>>();
  if (rawPayload && typeof rawPayload === "object") {
    const confirmedAt = (rawPayload as Record<string, unknown>).confirmedAt;
    activeOrderConfirmedAt.value =
      typeof confirmedAt === "string" && confirmedAt.length > 0
        ? confirmedAt
        : order.is_locked
          ? order.locked_at
          : null;
    const payloadItems = (rawPayload as Record<string, unknown>).items;
    if (Array.isArray(payloadItems)) {
      for (const item of payloadItems) {
        if (!item || typeof item !== "object") {
          continue;
        }
        const casted = item as Record<string, unknown>;
        const id = typeof casted.id === "string" ? casted.id : null;
        const labels =
          casted.selectedOptionLabels &&
          typeof casted.selectedOptionLabels === "object"
            ? (casted.selectedOptionLabels as Record<string, string>)
            : null;
        if (!id || !labels) {
          continue;
        }
        labelsByCartLineId.set(id, labels);
      }
    }
  } else {
    activeOrderConfirmedAt.value = null;
  }

  const itemsResult = await neonClient
    .from("order_items")
    .select("cart_line_id,product_id,quantity,selected_options")
    .eq("order_id", order.id);
  if (itemsResult.error) {
    throw itemsResult.error;
  }

  const cartItems = (
    (itemsResult.data ?? []) as Array<{
      cart_line_id: string;
      product_id: string;
      quantity: number;
      selected_options: Record<string, string>;
    }>
  ).map((item) => {
    const storedOptions = normalizeSelectedOptions(
      (item.selected_options ?? {}) as Record<string, string>,
    );
    const catalogProduct = findProductByOrderProductId(
      products,
      item.product_id,
      storedOptions,
    );
    const selectedOptions = withImpliedOptions(
      catalogProduct,
      item.product_id,
      storedOptions,
    );
    const catalogProductId = catalogProduct?.id ?? item.product_id;
    return {
      id: buildCartItemId(catalogProductId, selectedOptions),
      productId: catalogProductId,
      quantity: item.quantity,
      selectedOptions,
      selectedOptionLabels: labelsByCartLineId.get(item.cart_line_id),
    };
  });

  if (activeOrderConfirmedAt.value) {
    const lines = cartItems
      .map((item) => {
        const product = findProductByOrderProductId(
          products,
          item.productId,
          item.selectedOptions,
        );
        if (!product) {
          return null;
        }

        const orderSelection = resolveOrderProductSelection(
          product,
          item.selectedOptions,
        );
        return {
          id: item.id,
          quantity: item.quantity,
          lineTotal: item.quantity * orderSelection.unitPrice,
          selectedOptions: item.selectedOptions,
          selectedOptionLabels: item.selectedOptionLabels,
          product,
        };
      })
      .filter((line): line is NonNullable<typeof line> => line !== null);

    const subtotal = lines.reduce((total, line) => total + line.lineTotal, 0);
    const creditUsed = Math.min(COMPANY_CREDIT, subtotal);
    const creditRemaining = Math.max(COMPANY_CREDIT - creditUsed, 0);
    const walletToPay = Math.max(subtotal - COMPANY_CREDIT, 0);

    placedOrderPreview.value = {
      cartLines: lines,
      subtotal,
      creditUsed,
      creditRemaining,
      walletToPay,
    };
    actions.replaceCart([]);
  } else {
    placedOrderPreview.value = {
      cartLines: [],
      subtotal: 0,
      creditUsed: 0,
      creditRemaining: 0,
      walletToPay: 0,
    };
    actions.replaceCart(cartItems);
  }
};

// Le panier est local tant qu'on n'est pas connecté: rien à exiger ici.
const ensureOrderEditable = () => true;

// Confirmer une commande exige un compte: on envoie vers la connexion
// Google. Le panier survit à l'aller-retour (sessionStorage).
const requireSignIn = () => {
  if (sessionUser.value) {
    return true;
  }
  actions.enqueueToast(t.value.signInToOrder);
  void onConnectGoogle();
  return false;
};

const onConnectGoogle = async () => {
  authBusy.value = true;
  try {
    const result = await neonClient.auth.signIn.social({
      provider: "google",
      callbackURL: window.location.href,
    });
    if ((result as { error?: { message?: string } })?.error) {
      throw new Error(
        (result as { error?: { message?: string } }).error?.message ??
          "Connexion Google impossible",
      );
    }
  } catch (error) {
    console.error(error);
    actions.enqueueToast(
      error instanceof Error ? error.message : "Authentification impossible",
    );
  } finally {
    authBusy.value = false;
  }
};

const onSignOut = async () => {
  try {
    await neonClient.auth.signOut();
  } finally {
    sessionUser.value = null;
    isAdmin.value = false;
    activeOrderId.value = null;
    activeOrderLocked.value = false;
    activeOrderPlacedAt.value = null;
    activeOrderConfirmedAt.value = null;
    activeOrderLockDeadlineAt.value = EDITION.orderDeadline;
    actions.replaceCart([]);
    currentView.value = "catalog";
  }
};

const loadAdminDashboard = async () => {
  if (!isAdmin.value) {
    return;
  }

  adminLoading.value = true;
  adminError.value = null;
  try {
    const usersResult = await neonClient
      .from("app_users")
      .select("user_id,email,display_name,created_at,last_seen_at")
      .order("last_seen_at", { ascending: false });
    if (
      usersResult.error &&
      isPolicyRecursionError(usersResult.error, "admin_users")
    ) {
      warnPolicyRecursionOnce("admin_users");
      adminUsers.value = [];
    }
    if (
      usersResult.error &&
      !isMissingTableError(usersResult.error, "app_users")
    ) {
      if (isPolicyRecursionError(usersResult.error, "admin_users")) {
        // Continue loading orders even if app_users is blocked by recursive policy.
      } else if (isPermissionDeniedError(usersResult.error, "app_users")) {
        adminError.value =
          "Permission base de données manquante pour app_users.";
        return;
      } else {
        throw usersResult.error;
      }
    }
    if (
      usersResult.error &&
      isMissingTableError(usersResult.error, "app_users")
    ) {
      warnMissingTableOnce("app_users");
    }

    const ordersResult = await neonClient
      .from("orders")
      .select("id,user_id,user_email,item_count,subtotal,is_locked,created_at")
      .order("created_at", { ascending: false });
    if (ordersResult.error) {
      if (isPermissionDeniedError(ordersResult.error, "orders")) {
        adminError.value = "Permission base de données manquante pour orders.";
        return;
      }
      throw ordersResult.error;
    }

    const orderItemsResult = await neonClient
      .from("order_items")
      .select("order_id,product_id,product_name,quantity,selected_options");
    if (orderItemsResult.error) {
      throw orderItemsResult.error;
    }

    if (!usersResult.error) {
      adminUsers.value = (usersResult.data ?? []) as Array<{
        user_id: string;
        email: string;
        display_name: string;
        created_at: string;
        last_seen_at: string | null;
      }>;
    }
    const usersById = new Map(
      adminUsers.value.map((user) => [user.user_id, user.display_name]),
    );
    adminOrders.value = (
      (ordersResult.data ?? []) as Array<{
        id: string;
        user_id: string;
        user_email: string | null;
        item_count: number;
        subtotal: string | number;
        is_locked: boolean;
        created_at: string;
      }>
    ).map((order) => {
      const billing = computeBillableByPerson(
        Number(order.subtotal),
        COMPANY_CREDIT,
      );
      return {
        id: order.id,
        user_name:
          usersById.get(order.user_id) ??
          order.user_email?.split("@")[0] ??
          "-",
        user_email: order.user_email,
        item_count: order.item_count,
        total_per_person: billing.total,
        billable_per_person: billing.billable,
        is_locked: order.is_locked,
        created_at: order.created_at,
      };
    });

    const itemSummaryMap = new Map<
      string,
      {
        key: string;
        product_name: string;
        variants: string;
        total_quantity: number;
        order_ids: Set<string>;
        supplier: SupplierId | null;
      }
    >();

    (
      (orderItemsResult.data ?? []) as Array<{
        order_id: string;
        product_id: string | null;
        product_name: string;
        quantity: number;
        selected_options: Record<string, string> | null;
      }>
    ).forEach((item) => {
      const storedOptions = normalizeSelectedOptions(
        (item.selected_options ?? {}) as Record<string, string>,
      );
      // Le fournisseur vient de la fiche produit (content/products/*.md).
      const product = item.product_id
        ? findProductByOrderProductId(products, item.product_id, storedOptions)
        : null;
      const selectedOptions = withImpliedOptions(
        product,
        item.product_id ?? "",
        storedOptions,
      );
      const variants =
        formatVariantChips(
          getVariantChips(
            { selectedOptions, product: product ?? {} },
            locale.value,
          ),
        ) || "Défaut";
      const supplier = product?.supplier ?? null;
      const key = `${supplier ?? "-"}::${item.product_name}::${variants}`;
      const existing = itemSummaryMap.get(key);
      if (existing) {
        existing.total_quantity += item.quantity;
        existing.order_ids.add(item.order_id);
        return;
      }

      itemSummaryMap.set(key, {
        key,
        product_name: item.product_name,
        variants,
        total_quantity: item.quantity,
        order_ids: new Set([item.order_id]),
        supplier,
      });
    });

    adminItemsSummary.value = Array.from(itemSummaryMap.values())
      .map((entry) => ({
        key: entry.key,
        product_name: entry.product_name,
        variants: entry.variants,
        total_quantity: entry.total_quantity,
        order_count: entry.order_ids.size,
        supplier: entry.supplier,
      }))
      .sort((a, b) => b.total_quantity - a.total_quantity);
  } catch (error) {
    adminError.value =
      error instanceof Error
        ? error.message
        : "Impossible de charger les données admin";
  } finally {
    adminLoading.value = false;
  }
};

const onOpenAdmin = async () => {
  if (!isAdmin.value) {
    return;
  }
  currentView.value = "admin";
  await loadAdminDashboard();
};

const submitOrder = async () => {
  if (isReadOnlyForCurrentUser.value) {
    return;
  }
  if (derived.cartLines.value.length === 0 || isSubmittingOrder.value) {
    return;
  }

  if (!requireSignIn()) {
    return;
  }

  isSubmittingOrder.value = true;
  try {
    const shouldConfirm = !activeOrderConfirmedAt.value;
    const persisted = await persistCartDraft(true, shouldConfirm);
    if (!persisted) {
      return;
    }

    if (shouldConfirm) {
      actions.enqueueToast(t.value.orderSent);
    } else {
      actions.enqueueToast(t.value.reopenOrder);
    }

    await loadCurrentUserOrder();
    currentView.value = shouldConfirm ? "placed" : "confirmation";
  } finally {
    isSubmittingOrder.value = false;
  }
};

onMounted(async () => {
  if (typeof window !== "undefined") {
    const savedView = window.sessionStorage.getItem(VIEW_SESSION_KEY);
    if (
      savedView === "confirmation" ||
      savedView === "placed" ||
      savedView === "admin"
    ) {
      currentView.value = savedView;
    }

    isViewOnly.value = window.localStorage.getItem(VIEW_ONLY_CACHE_KEY) === "1";
  }

  if (window.location.hostname === "127.0.0.1") {
    const normalizedUrl = new URL(window.location.href);
    normalizedUrl.hostname = "localhost";
    window.location.replace(normalizedUrl.toString());
    return;
  }

  try {
    await loadGlobalViewOnlySetting();
    await refreshSession();
    if (
      (currentView.value === "admin" || currentView.value === "admin-order") &&
      !isAdmin.value
    ) {
      currentView.value = "catalog";
    }
    await loadCurrentUserOrder(true);
  } catch (error) {
    console.error(error);
  } finally {
    authBusy.value = false;
  }
});

watch(currentView, (nextView) => {
  if (typeof window === "undefined") {
    return;
  }

  const persistedView = nextView === "admin-order" ? "admin" : nextView;
  window.sessionStorage.setItem(VIEW_SESSION_KEY, persistedView);
});

watch(isViewOnly, (nextValue) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(VIEW_ONLY_CACHE_KEY, nextValue ? "1" : "0");
});

watch(
  () => [currentView.value, isAdmin.value] as const,
  async ([view, admin]) => {
    if (adminRefreshTimer) {
      window.clearInterval(adminRefreshTimer);
      adminRefreshTimer = null;
    }

    if (!admin || view !== "admin") {
      return;
    }

    await loadAdminDashboard();
    adminRefreshTimer = window.setInterval(() => {
      void loadAdminDashboard();
    }, 30000);
  },
  { immediate: true },
);

watch(
  () => sessionUser.value?.id ?? null,
  async () => {
    if (typeof window === "undefined") {
      return;
    }

    if (viewOnlyRefreshTimer) {
      window.clearInterval(viewOnlyRefreshTimer);
      viewOnlyRefreshTimer = null;
    }

    await loadGlobalViewOnlySetting();
    viewOnlyRefreshTimer = window.setInterval(() => {
      void loadGlobalViewOnlySetting();
    }, 30000);
  },
  { immediate: true },
);

onUnmounted(() => {
  if (adminRefreshTimer) {
    window.clearInterval(adminRefreshTimer);
    adminRefreshTimer = null;
  }
  if (viewOnlyRefreshTimer) {
    window.clearInterval(viewOnlyRefreshTimer);
    viewOnlyRefreshTimer = null;
  }
});
</script>
