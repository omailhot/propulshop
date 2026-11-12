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
    :orders-label="t.myOrders"
    :show-credit="currentView === 'catalog' && !isReadOnlyForCurrentUser"
    :credit-label="t.creditRemainingShort"
    :credit-remaining-label="
      isCreditKnown
        ? formatCurrency.format(derived.creditRemaining.value)
        : t.toBeDetermined
    "
    @connect-google="onConnectGoogle"
    @sign-out="onSignOut"
    @open-admin="onOpenAdmin"
    @open-orders="onOpenOrders"
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
      class="mx-auto flex max-w-6xl flex-col items-start gap-2.5 py-3 pr-32 pl-4 sm:flex-row sm:items-center sm:gap-5 sm:pr-64 sm:pl-8 lg:pr-[calc(var(--cart-panel-clearance)+2rem)]"
      :class="{ 'has-cart-panel': !isReadOnlyForCurrentUser }"
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
      <div v-if="isAdminView">
        <nav class="mb-4 flex gap-1" aria-label="Administration">
          <Button
            v-for="section in adminSections"
            :key="section.view"
            size="sm"
            :variant="
              activeAdminSection === section.view ? 'secondary' : 'ghost'
            "
            @click="currentView = section.view"
          >
            {{ section.label }}
          </Button>
        </nav>

        <AdminDashboard
          v-if="currentView === 'admin'"
          :t="t"
          :loading="adminLoading"
          :error="adminError"
          :orders="adminOrders"
          :items-summary="adminItemsSummary"
          :suppliers="suppliers"
          :editions="editions"
          :users="adminUsers"
          @refresh="loadAdminDashboard"
          @select-order="onOpenAdminOrder"
          @delete-order="onDeleteAdminOrder"
        />

        <AdminProductsPage
          v-else-if="currentView === 'admin-products'"
          :locale="locale"
          :products="products"
          :suppliers="suppliers"
          :format-currency="formatCurrency"
          :has-load-failed="hasCatalogLoadFailed"
          :save-product="saveProduct"
          :remove-product="removeProduct"
          :reorder-products="reorderProducts"
        />

        <AdminEditionsPage
          v-else-if="currentView === 'admin-editions'"
          :locale="locale"
          :editions="editions"
          :order-count-by-edition="adminOrderCountByEdition"
          :add-edition="addEdition"
          :save-edition="saveEdition"
          :remove-edition="removeEdition"
        />

        <AdminOrderDetailsPage
          v-else
          :t="t"
          :locale="locale"
          :cart-lines="adminOrderLines"
          :format-currency="formatCurrency"
          :suppliers="suppliers"
          :has-suppliers="adminOrderHasSuppliers"
          @back="currentView = 'admin'"
        />
      </div>
      <div
        v-else-if="currentView === 'catalog'"
        :class="{ 'has-cart-panel': !isReadOnlyForCurrentUser }"
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
          v-if="isEditingPlacedOrder"
          class="bg-ocre-pale mr-(--cart-panel-clearance) mb-6 flex flex-col gap-3 rounded-lg p-4"
          role="status"
        >
          <div class="flex items-start gap-3">
            <Pencil class="text-ocre mt-0.5 size-4 shrink-0" />
            <div>
              <p class="font-semibold">{{ t.editingBannerTitle }}</p>
              <p class="mt-0.5 text-sm">{{ t.editingBannerBody }}</p>
            </div>
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:pl-7">
            <Button variant="outline" @click="onCancelEdit">
              {{ t.cancelEdit }}
            </Button>
            <Button variant="outline" @click="onContinueCheckout">
              {{ t.reviewChanges }}
            </Button>
          </div>
        </div>

        <div
          v-else-if="isOrderPlaced"
          class="mr-(--cart-panel-clearance) mb-6 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
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
                {{ orderPlacedLabel }}
              </p>
            </div>
          </div>
          <div class="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button
              v-if="!isReadOnlyForCurrentUser"
              variant="outline"
              @click="onStartEditingOrder"
            >
              {{ t.modifyOrder }}
            </Button>
            <Button variant="outline" @click="currentView = 'placed'">
              {{ t.viewMyOrder }}
            </Button>
          </div>
        </div>

        <!-- L'accueil: un titre et une ligne de faits. Rien d'autre. -->
        <section class="pr-(--cart-panel-clearance) pb-8 sm:pb-10">
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

        <p
          v-if="shopProducts.length === 0 && catalogStatusMessage"
          class="text-muted-foreground mb-4 text-sm"
          role="status"
        >
          {{ catalogStatusMessage }}
        </p>

        <CatalogSection
          :t="t"
          :locale="locale"
          :products="shopProducts"
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
        :credit-total="companyCredit"
        :credit-known="isCreditKnown"
        :format-currency="formatCurrency"
        :is-submitting="isSubmittingOrder"
        :is-editing-placed-order="isEditingPlacedOrder"
        :view-only="isReadOnlyForCurrentUser"
        :back-label="t.backToCatalog"
        @back="onBackToCatalog"
        @remove-item="onRemoveCartItem"
        @update-item-quantity="onUpdateCartItemQuantity"
        @update-item-variants="onUpdateCartItemVariants"
        @place-order="submitOrder"
        @cancel-edit="onCancelEdit"
      />
      <OrderPlacedPage
        v-else-if="currentView === 'placed'"
        :t="t"
        :locale="locale"
        :cart-lines="placedOrderLines"
        :can-edit="!isReadOnlyForCurrentUser"
        @back="onBackToCatalog"
        @edit-order="onStartEditingOrder"
      />
      <OrderHistoryPage
        v-else
        :t="t"
        :locale="locale"
        :orders="orderHistory"
        :format-currency="formatCurrency"
        @back="onBackToCatalog"
      />
    </div>
  </main>

  <ProductDetailsModal
    :t="t"
    :locale="locale"
    :product="derived.activeProduct.value"
    :open="Boolean(state.activeProductId.value)"
    :format-currency="formatCurrency"
    :read-only="isReadOnlyForCurrentUser"
    :initial-options="activeProductInitialOptions"
    @close="actions.setActiveProductId(null)"
    @add-to-cart="onAddToCart"
  />

  <!-- Les avis vivent en bas, le panier en haut: ils ne se croisent jamais. -->
  <Toaster position="bottom-right" />

  <!--
    Panier flottant, en haut à droite sous l'en-tête collant. Sur grand
    écran: un résumé complet (lignes, sous-total, crédit) qui passe par-dessus
    la grille; le haut de page lui laisse la place. Ailleurs: une pastille
    compacte.
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

    <aside
      class="bg-card fixed top-20 right-4 z-30 hidden w-72 rounded-lg border p-5 shadow-lg lg:block"
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
      <ul v-else class="mt-3 max-h-[30vh] space-y-2 overflow-y-auto text-sm">
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
              isCreditKnown
                ? formatCurrency.format(derived.creditRemaining.value)
                : t.toBeDetermined
            }}
          </dd>
        </div>
        <div
          v-if="isCreditKnown && derived.walletToPay.value > 0"
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
    :credit-total="companyCredit"
    :credit-known="isCreditKnown"
    :format-currency="formatCurrency"
    :read-only="isReadOnlyForCurrentUser"
    @close="actions.setCartOpen(false)"
    @reset-cart="onResetCart"
    @remove-item="onRemoveCartItem"
    @update-item-quantity="onUpdateCartItemQuantity"
    @continue-checkout="onContinueCheckout"
  />
</template>

<script setup lang="ts">
import { Check, Lock, Pencil, ShoppingBag } from "lucide-vue-next";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

import Header from "@/components/Header.vue";
import AdminDashboard from "@/components/merch/AdminDashboard.vue";
import AdminOrderDetailsPage from "@/components/merch/AdminOrderDetailsPage.vue";
import AdminEditionsPage from "@/components/merch/admin-editions/AdminEditionsPage.vue";
import AdminProductsPage from "@/components/merch/admin-products/AdminProductsPage.vue";
import CartDrawer from "@/components/merch/CartDrawer.vue";
import CatalogSection from "@/components/merch/CatalogSection.vue";
import OrderConfirmationPage from "@/components/merch/OrderConfirmationPage.vue";
import OrderHistoryPage from "@/components/merch/OrderHistoryPage.vue";
import OrderPlacedPage from "@/components/merch/OrderPlacedPage.vue";
import ProductDetailsModal from "@/components/merch/ProductDetailsModal.vue";
import Button from "@/components/ui/Button.vue";
import { Toaster } from "@/components/ui/sonner";
import {
  formatCreditAmount,
  formatDeadlineDate,
  getEditionName,
  isDeadlinePassed,
} from "@/config/edition";
import { createMerchCopy } from "@/config/merch-copy";
import { useEditions } from "@/hooks/use-editions";
import { useMerchStore } from "@/hooks/use-merch-store";
import { useProductCatalog } from "@/hooks/use-product-catalog";
import {
  buildCartItemId,
  computeBillableByPerson,
  GIFT_CARD_DEFAULT_AMOUNT,
  GIFT_CARD_MAX_AMOUNT,
  GIFT_CARD_MIN_AMOUNT,
  normalizeSelectedOptions,
  resolveOrderProductSelection,
  toCartItem,
  toOrderLineView,
  validateGiftCardAmount,
} from "@/lib/merch-order";
import { neonClient } from "@/lib/neon-client";
import {
  deleteOrder,
  fetchAllOrders,
  fetchUserOrders,
  type OrderPayload,
  type StoredOrder,
  saveOrder,
} from "@/lib/order-repository";
import { formatVariantChips, getVariantChips } from "@/lib/variant-labels";
import type { CartLineView, StoreLocale } from "@/types/merch";

type View =
  | "catalog"
  | "confirmation"
  | "placed"
  | "orders"
  | "admin"
  | "admin-order"
  | "admin-products"
  | "admin-editions";

const locale = computed<StoreLocale>(() => "fr");
const {
  editions,
  currentEdition,
  isCreditKnown,
  companyCredit,
  getEdition,
  loadEditions,
  addEdition,
  saveEdition,
  removeEdition,
} = useEditions();
const t = computed(() => createMerchCopy(currentEdition.value)[locale.value]);
const intlLocale = computed(() => (locale.value === "fr" ? "fr-CA" : "en-CA"));

const formatCurrency = computed(
  () =>
    new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }),
);

const {
  products,
  shopProducts,
  suppliers,
  isLoaded: isCatalogLoaded,
  hasLoadFailed: hasCatalogLoadFailed,
  loadProducts,
  saveProduct,
  removeProduct,
  reorderProducts,
} = useProductCatalog();
const { state, derived, actions } = useMerchStore(products, companyCredit);
const currentView = ref<View>("catalog");
const VIEW_SESSION_KEY = "propulshop-current-view";
const EDITING_SESSION_KEY = "propulshop-editing-order";
const RESTORABLE_VIEWS: View[] = [
  "confirmation",
  "placed",
  "orders",
  "admin",
  "admin-products",
  "admin-editions",
];
const EDITIONS_REFRESH_MS = 30000;
const ADMIN_ORDER_VIEWS: View[] = ["admin", "admin-editions"];
const adminSections: Array<{ view: View; label: string }> = [
  { view: "admin", label: "Commandes" },
  { view: "admin-products", label: "Articles" },
  { view: "admin-editions", label: "Éditions" },
];
const isSubmittingOrder = ref(false);
const authBusy = ref(true);
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
const adminStoredOrders = ref<StoredOrder[]>([]);
const adminLoading = ref(false);
const adminError = ref<string | null>(null);
const adminSelectedOrderId = ref<string | null>(null);
const userOrders = ref<StoredOrder[]>([]);
const isEditingPlacedOrder = ref(false);
let pendingOrderSave: Promise<unknown> = Promise.resolve();
let adminRefreshTimer: number | null = null;
let editionsRefreshTimer: number | null = null;

// La sélection de départ de la fiche produit: la couleur choisie sur la carte.
const activeProductInitialOptions = ref<Record<string, string>>({});
const welcomeCredit = computed(() =>
  formatCreditAmount(currentEdition.value.creditPerEmployee, locale.value),
);
const welcomeDeadline = computed(() =>
  formatDeadlineDate(currentEdition.value.orderDeadline, locale.value, "long"),
);

const isAdminView = computed(() => currentView.value.startsWith("admin"));
const activeAdminSection = computed<View>(() =>
  currentView.value === "admin-order" ? "admin" : currentView.value,
);
const isReadOnlyForCurrentUser = computed(
  () => !currentEdition.value.isOpen || isDeadlinePassed(currentEdition.value),
);
const activeOrder = computed(
  () =>
    userOrders.value.find(
      (order) => order.edition === currentEdition.value.number,
    ) ?? null,
);
const isOrderPlaced = computed(() => Boolean(activeOrder.value?.placedAt));
const placedOrderLines = computed<CartLineView[]>(() =>
  isOrderPlaced.value
    ? (activeOrder.value?.items ?? []).map((item) =>
        toOrderLineView(item, products.value),
      )
    : [],
);
const formatPlacedDate = (placedAt: string) =>
  new Date(placedAt).toLocaleDateString(intlLocale.value, {
    dateStyle: "long",
  });
const orderPlacedLabel = computed(() =>
  activeOrder.value?.placedAt
    ? `${t.value.orderPlacedOn} ${formatPlacedDate(activeOrder.value.placedAt)}.`
    : "",
);
const orderHistory = computed(() =>
  userOrders.value
    .filter((order) => order.placedAt)
    .map((order) => {
      const edition = getEdition(order.edition);
      const billing = computeBillableByPerson(
        order.subtotal,
        edition.creditPerEmployee ?? 0,
      );
      return {
        id: order.id,
        editionName: getEditionName(edition.number, locale.value),
        isCurrentEdition: edition.number === currentEdition.value.number,
        isCreditKnown: edition.creditPerEmployee !== null,
        placedLabel: `${t.value.orderPlacedOn} ${formatPlacedDate(order.placedAt ?? "")}`,
        lines: order.items.map((item) => toOrderLineView(item, products.value)),
        subtotal: billing.total,
        creditUsed: billing.total - billing.billable,
        walletToPay: billing.billable,
      };
    }),
);
const catalogStatusMessage = computed(() => {
  if (isCatalogLoaded.value) {
    return "";
  }
  if (!hasCatalogLoadFailed.value || authBusy.value) {
    return t.value.catalogLoading;
  }
  return sessionUser.value
    ? t.value.catalogUnavailable
    : t.value.catalogSignInRequired;
});

const adminUserNames = computed(
  () =>
    new Map(adminUsers.value.map((user) => [user.user_id, user.display_name])),
);
const adminOrders = computed(() =>
  adminStoredOrders.value.map((order) => {
    const billing = computeBillableByPerson(
      order.subtotal,
      getEdition(order.edition).creditPerEmployee ?? 0,
    );
    return {
      id: order.id,
      edition: order.edition,
      user_id: order.userId,
      user_name:
        adminUserNames.value.get(order.userId) ??
        order.userEmail?.split("@")[0] ??
        "-",
      user_email: order.userEmail,
      item_count: order.itemCount,
      total_per_person: billing.total,
      billable_per_person: billing.billable,
      is_placed: Boolean(order.placedAt),
      created_at: order.createdAt,
    };
  }),
);
const adminItemsSummary = computed(() => {
  const summaryByKey = new Map<
    string,
    {
      key: string;
      edition: number;
      product_name: string;
      variants: string;
      total_quantity: number;
      order_ids: Set<string>;
      supplier: string | null;
      supplier_variants: string;
      supplier_url: string | null;
    }
  >();

  for (const order of adminStoredOrders.value) {
    if (!order.placedAt) {
      continue;
    }
    for (const item of order.items) {
      const line = toOrderLineView(item, products.value);
      const variants =
        formatVariantChips(getVariantChips(line, locale.value)) || "Défaut";
      const supplier = line.product.supplier ?? null;
      const key = `${order.edition}::${supplier ?? "-"}::${item.productName}::${variants}`;
      const existing = summaryByKey.get(key);
      if (existing) {
        existing.total_quantity += item.quantity;
        existing.order_ids.add(order.id);
        continue;
      }
      summaryByKey.set(key, {
        key,
        edition: order.edition,
        product_name: item.productName,
        variants,
        total_quantity: item.quantity,
        order_ids: new Set([order.id]),
        supplier,
        supplier_variants: formatVariantChips(
          getVariantChips(line, locale.value, "supplier"),
        ),
        supplier_url: line.product.supplierUrl ?? null,
      });
    }
  }

  return Array.from(summaryByKey.values())
    .map(({ order_ids, ...entry }) => ({
      ...entry,
      order_count: order_ids.size,
    }))
    .sort((a, b) => b.total_quantity - a.total_quantity);
});
const adminOrderCountByEdition = computed(() => {
  const countByEdition = new Map<number, number>();
  for (const order of adminStoredOrders.value) {
    countByEdition.set(
      order.edition,
      (countByEdition.get(order.edition) ?? 0) + 1,
    );
  }
  return countByEdition;
});
const adminSelectedOrder = computed(
  () =>
    adminStoredOrders.value.find(
      (order) => order.id === adminSelectedOrderId.value,
    ) ?? null,
);
const adminOrderLines = computed<CartLineView[]>(() =>
  (adminSelectedOrder.value?.items ?? []).map((item) =>
    toOrderLineView(item, products.value),
  ),
);
const adminOrderHasSuppliers = computed(
  () =>
    getEdition(adminSelectedOrder.value?.edition ?? currentEdition.value.number)
      .hasSuppliers,
);

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

  const product = products.value.find((item) => item.id === productId);
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

  runCartAction(() => {
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
  runCartAction(() => {
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
  actions.resetCart();
  void persistCartDraft();
};

const onRemoveCartItem = (cartItemId: string) => {
  if (isReadOnlyForCurrentUser.value) {
    return;
  }
  actions.removeCartItem(cartItemId);
  void persistCartDraft();
};

const onUpdateCartItemQuantity = (cartItemId: string, nextQuantity: number) => {
  if (isReadOnlyForCurrentUser.value) {
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

const onOpenOrders = () => {
  currentView.value = "orders";
};

const onStartEditingOrder = () => {
  if (!activeOrder.value?.placedAt || isReadOnlyForCurrentUser.value) {
    return;
  }
  actions.replaceCart(
    activeOrder.value.items.map((item) => toCartItem(item, products.value)),
  );
  isEditingPlacedOrder.value = true;
  currentView.value = "catalog";
};

const onCancelEdit = () => {
  isEditingPlacedOrder.value = false;
  actions.replaceCart([]);
  actions.setCartOpen(false);
  currentView.value = "catalog";
};

const runCartAction = (action: () => void) => {
  if (isOrderPlaced.value && !isEditingPlacedOrder.value) {
    onStartEditingOrder();
    actions.enqueueToast(t.value.orderEditStarted);
  }
  action();
};

const onOpenAdminOrder = (orderId: string) => {
  if (!isAdmin.value) {
    return;
  }
  adminSelectedOrderId.value = orderId;
  currentView.value = "admin-order";
};

const onDeleteAdminOrder = async (orderId: string) => {
  if (!isAdmin.value) {
    return;
  }

  try {
    await deleteOrder(orderId);
    if (adminSelectedOrderId.value === orderId) {
      adminSelectedOrderId.value = null;
      currentView.value = "admin";
    }
    if (activeOrder.value?.id === orderId) {
      await loadUserOrders();
    }
    await loadAdminDashboard();
    actions.enqueueToast("Commande supprimée avec succès.");
  } catch (error) {
    console.error(error);
    actions.enqueueToast(t.value.orderSendFailed);
  }
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

const enqueueOrderSave = <T,>(task: () => Promise<T>) => {
  const run = pendingOrderSave.then(task, task);
  pendingOrderSave = run.catch(() => undefined);
  return run;
};

const writeOrder = async (placedAt: string | null) => {
  if (!sessionUser.value) {
    return;
  }
  const userId = sessionUser.value.id;
  const existingOrder = activeOrder.value;

  if (derived.cartLines.value.length === 0) {
    if (existingOrder) {
      await deleteOrder(existingOrder.id);
      userOrders.value = userOrders.value.filter(
        (order) => order.id !== existingOrder.id,
      );
    }
    return;
  }

  const payload = getOrderPayload();
  const orderId = await saveOrder({
    orderId: existingOrder?.id ?? null,
    userId,
    userEmail: sessionUser.value.email,
    edition: currentEdition.value.number,
    placedAt,
    payload,
  });
  if (!existingOrder) {
    userOrders.value = [
      {
        id: orderId,
        edition: currentEdition.value.number,
        userId,
        userEmail: sessionUser.value.email,
        itemCount: payload.itemCount,
        subtotal: payload.totals.subtotal,
        placedAt,
        createdAt: payload.submittedAt,
        items: [],
      },
      ...userOrders.value,
    ];
  }
};

const persistCartDraft = async () => {
  if (!sessionUser.value || !isCatalogLoaded.value || isOrderPlaced.value) {
    return;
  }
  try {
    await enqueueOrderSave(() => writeOrder(null));
  } catch (error) {
    console.error(error);
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
    userOrders.value = [];
    isEditingPlacedOrder.value = false;
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

const loadUserOrders = async (keepLocalCart = false) => {
  if (!sessionUser.value) {
    return;
  }

  userOrders.value = await fetchUserOrders(sessionUser.value.id);
  const order = activeOrder.value;

  if (!order) {
    isEditingPlacedOrder.value = false;
    // Premier chargement après la connexion: un panier rempli avant de se
    // connecter devient le brouillon de la commande.
    if (keepLocalCart && derived.cartLines.value.length > 0) {
      void persistCartDraft();
    } else {
      actions.replaceCart([]);
    }
    return;
  }

  if (order.placedAt) {
    if (!isEditingPlacedOrder.value || derived.cartLines.value.length === 0) {
      isEditingPlacedOrder.value = false;
      actions.replaceCart([]);
    }
    return;
  }

  isEditingPlacedOrder.value = false;
  actions.replaceCart(
    order.items.map((item) => toCartItem(item, products.value)),
  );
};

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
    userOrders.value = [];
    isEditingPlacedOrder.value = false;
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
    if (usersResult.error) {
      if (isPolicyRecursionError(usersResult.error, "admin_users")) {
        warnPolicyRecursionOnce("admin_users");
        adminUsers.value = [];
      } else if (isMissingTableError(usersResult.error, "app_users")) {
        warnMissingTableOnce("app_users");
      } else if (isPermissionDeniedError(usersResult.error, "app_users")) {
        adminError.value =
          "Permission base de données manquante pour app_users.";
        return;
      } else {
        throw usersResult.error;
      }
    } else {
      adminUsers.value = (usersResult.data ?? []) as typeof adminUsers.value;
    }

    adminStoredOrders.value = await fetchAllOrders();
  } catch (error) {
    adminError.value = isPermissionDeniedError(error, "orders")
      ? "Permission base de données manquante pour orders."
      : error instanceof Error
        ? error.message
        : "Impossible de charger les données admin";
  } finally {
    adminLoading.value = false;
  }
};

const onOpenAdmin = () => {
  if (!isAdmin.value) {
    return;
  }
  currentView.value = "admin";
};

const submitOrder = async () => {
  if (isReadOnlyForCurrentUser.value || isSubmittingOrder.value) {
    return;
  }
  const isCancellingOrder =
    isEditingPlacedOrder.value && derived.cartLines.value.length === 0;
  if (derived.cartLines.value.length === 0 && !isCancellingOrder) {
    return;
  }

  if (!requireSignIn()) {
    return;
  }

  isSubmittingOrder.value = true;
  try {
    const wasPlaced = isOrderPlaced.value;
    const placedAt = activeOrder.value?.placedAt ?? new Date().toISOString();
    await enqueueOrderSave(() => writeOrder(placedAt));
    isEditingPlacedOrder.value = false;
    await loadUserOrders();

    if (isCancellingOrder) {
      actions.enqueueToast(t.value.orderCancelled);
      currentView.value = "catalog";
      return;
    }
    actions.enqueueToast(wasPlaced ? t.value.orderUpdated : t.value.orderSent);
    currentView.value = "placed";
  } catch (error) {
    console.error(error);
    actions.enqueueToast(t.value.orderSendFailed);
  } finally {
    isSubmittingOrder.value = false;
  }
};

onMounted(async () => {
  const savedView = window.sessionStorage.getItem(VIEW_SESSION_KEY) as View;
  if (RESTORABLE_VIEWS.includes(savedView)) {
    currentView.value = savedView;
  }
  isEditingPlacedOrder.value =
    window.sessionStorage.getItem(EDITING_SESSION_KEY) === "1";

  if (window.location.hostname === "127.0.0.1") {
    const normalizedUrl = new URL(window.location.href);
    normalizedUrl.hostname = "localhost";
    window.location.replace(normalizedUrl.toString());
    return;
  }

  try {
    await refreshSession();
    await loadEditions();
    if (isAdminView.value && !isAdmin.value) {
      currentView.value = "catalog";
    }
    await loadProducts();
    await loadUserOrders(true);
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

watch(isEditingPlacedOrder, (nextValue) => {
  window.sessionStorage.setItem(EDITING_SESSION_KEY, nextValue ? "1" : "0");
});

watch(
  () => [currentView.value, isAdmin.value] as const,
  async ([view, admin]) => {
    if (adminRefreshTimer) {
      window.clearInterval(adminRefreshTimer);
      adminRefreshTimer = null;
    }

    if (!admin || !ADMIN_ORDER_VIEWS.includes(view)) {
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
  () => currentEdition.value.number,
  () => {
    if (authBusy.value) {
      return;
    }
    isEditingPlacedOrder.value = false;
    loadUserOrders().catch(console.error);
  },
);

watch(
  () => sessionUser.value?.id ?? null,
  () => {
    if (editionsRefreshTimer) {
      window.clearInterval(editionsRefreshTimer);
    }
    editionsRefreshTimer = window.setInterval(() => {
      void loadEditions();
    }, EDITIONS_REFRESH_MS);
  },
  { immediate: true },
);

onUnmounted(() => {
  if (adminRefreshTimer) {
    window.clearInterval(adminRefreshTimer);
    adminRefreshTimer = null;
  }
  if (editionsRefreshTimer) {
    window.clearInterval(editionsRefreshTimer);
    editionsRefreshTimer = null;
  }
});
</script>
