<template>
  <section class="space-y-4">
    <h1 class="t-h1 pt-4 pb-2">Commandes de l'édition</h1>

    <div class="bg-card rounded-lg">
      <div
        class="flex flex-col items-stretch justify-between gap-3 border-b px-4 pt-3 sm:flex-row sm:items-end sm:px-6"
      >
        <!-- Onglets: le ruban signature souligne l'onglet actif. -->
        <div role="tablist" class="flex items-end gap-5">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            role="tab"
            :aria-selected="activeTab === tab.id"
            :class="[
              'focus-visible:ring-ring/40 relative cursor-pointer rounded-t-md pt-2 pb-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-[3px]',
              activeTab === tab.id
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            ]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
            <span
              v-if="activeTab === tab.id"
              class="bg-foreground absolute inset-x-0 -bottom-px h-0.5"
              aria-hidden="true"
            />
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-2 pb-3 sm:justify-end">
          <Button
            v-if="activeTab === 'items'"
            size="sm"
            variant="outline"
            :disabled="loading || Boolean(error) || filteredItems.length === 0"
            @click="exportItemsSummaryCsv"
          >
            <Download class="size-4" />
            {{ exportLabel }}
          </Button>
          <Button size="sm" variant="outline" @click="$emit('refresh')">
            <RefreshCw class="size-4" />
            Rafraîchir
          </Button>
        </div>
      </div>

      <div class="p-4 sm:p-6">
        <p
          v-if="error"
          class="bg-bordeaux-pale text-bordeaux rounded-md p-3 text-sm"
          role="alert"
        >
          {{ error }}
        </p>
        <p v-else-if="loading" class="text-muted-foreground text-sm">
          Chargement...
        </p>

        <!-- ================= Commandes ================= -->
        <p
          v-else-if="activeTab === 'orders' && orders.length === 0"
          class="text-muted-foreground text-sm"
        >
          Aucune commande.
        </p>
        <div v-else-if="activeTab === 'orders'" class="overflow-auto">
          <table class="w-full min-w-[54rem] text-sm">
            <thead>
              <tr class="text-muted-foreground text-left text-xs">
                <th class="py-2 pr-3 font-semibold">Nom</th>
                <th class="py-2 pr-3 font-semibold">{{ t.adminEmail }}</th>
                <th class="py-2 pr-3 text-right font-semibold">Articles</th>
                <th class="py-2 pr-3 text-right font-semibold">
                  {{ t.totalPerPerson }}
                </th>
                <th class="py-2 pr-3 text-right font-semibold">
                  {{ t.billablePerPerson }}
                </th>
                <th class="py-2 pr-3 font-semibold">Verrouillée</th>
                <th class="py-2 font-semibold">Date</th>
                <th class="py-2 pl-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="order in orders"
                :key="order.id"
                class="hover:bg-secondary/60 focus-visible:bg-secondary/60 cursor-pointer border-t transition-colors outline-none"
                role="button"
                tabindex="0"
                @click="$emit('select-order', order.id)"
                @keydown.enter="$emit('select-order', order.id)"
                @keydown.space.prevent="$emit('select-order', order.id)"
              >
                <td class="py-2.5 pr-3 font-semibold">{{ order.user_name }}</td>
                <td class="text-muted-foreground py-2.5 pr-3">
                  {{ order.user_email ?? "-" }}
                </td>
                <td class="t-num py-2.5 pr-3 text-right">{{ order.item_count }}</td>
                <td class="t-num py-2.5 pr-3 text-right">
                  {{ formatSubtotal(order.total_per_person) }}
                </td>
                <td class="t-num py-2.5 pr-3 text-right">
                  {{
                    creditKnown
                      ? formatSubtotal(order.billable_per_person)
                      : TO_BE_DETERMINED
                  }}
                </td>
                <td class="py-2.5 pr-3">
                  <Badge :variant="order.is_locked ? 'success' : 'warning'">
                    {{ order.is_locked ? "Oui" : "Non" }}
                  </Badge>
                </td>
                <td class="text-muted-foreground t-num py-2.5">
                  {{ formatDateTime(order.created_at) }}
                </td>
                <td class="py-2.5 pl-3 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    class="text-bordeaux hover:bg-bordeaux-pale hover:text-bordeaux"
                    @click.stop="openDeleteConfirm(order.id, order.user_name)"
                  >
                    Supprimer
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ============ Résumé de la commande, par fournisseur ============ -->
        <p
          v-else-if="itemsSummary.length === 0"
          class="text-muted-foreground text-sm"
        >
          Aucun article à agréger.
        </p>
        <div v-else>
          <div
            class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 class="font-sans text-base font-semibold tracking-normal">
                Résumé de la commande
              </h2>
              <p class="text-muted-foreground text-sm">
                Les articles à commander, séparés par fournisseur.
              </p>
            </div>
            <div
              role="radiogroup"
              aria-label="Filtrer par fournisseur"
              class="bg-secondary inline-flex flex-wrap gap-1 self-start rounded-md p-1"
            >
              <button
                v-for="filter in supplierFilters"
                :key="filter.id"
                type="button"
                role="radio"
                :aria-checked="supplierFilter === filter.id"
                :class="[
                  'focus-visible:ring-ring/40 inline-flex cursor-pointer items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-xs font-semibold transition-colors outline-none focus-visible:ring-[3px]',
                  supplierFilter === filter.id
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                ]"
                @click="supplierFilter = filter.id"
              >
                <span
                  v-if="filter.dot"
                  class="size-2 rounded-full"
                  :style="{ backgroundColor: filter.dot }"
                  aria-hidden="true"
                />
                {{ filter.label }}
                <span class="t-num text-muted-foreground font-normal">
                  {{ filter.quantity }}
                </span>
              </button>
            </div>
          </div>

          <p
            v-if="unspecifiedQuantity > 0"
            class="bg-ocre-pale mt-3 flex items-start gap-2 rounded-md p-3 text-sm"
            role="status"
          >
            <AlertTriangle class="text-ocre mt-0.5 size-4 shrink-0" />
            <span>
              {{ unspecifiedQuantity }} article(s) sans fournisseur: le produit
              n'existe plus dans le catalogue. Vérifier ces lignes avant de
              passer la commande.
            </span>
          </p>

          <div class="mt-4 overflow-auto">
            <table class="w-full min-w-[46rem] text-sm">
              <thead>
                <tr class="text-muted-foreground text-left text-xs">
                  <th class="py-2 pr-3 font-semibold">Fournisseur</th>
                  <th class="py-2 pr-3 font-semibold">Article</th>
                  <th class="py-2 pr-3 font-semibold">Variantes</th>
                  <th class="py-2 pr-3 text-right font-semibold">Quantité</th>
                  <th class="py-2 text-right font-semibold">Commandes</th>
                </tr>
              </thead>
              <tbody v-for="group in groupedItems" :key="group.id">
                <tr class="bg-secondary/60 border-t">
                  <th
                    colspan="3"
                    scope="colgroup"
                    class="px-2 py-2 text-left font-semibold"
                  >
                    <span class="inline-flex items-center gap-2">
                      <span
                        class="size-2 rounded-full"
                        :style="{ backgroundColor: group.dot }"
                        aria-hidden="true"
                      />
                      {{ group.label }}
                    </span>
                  </th>
                  <td class="t-num py-2 pr-3 text-right font-semibold">
                    {{ group.quantity }}
                  </td>
                  <td class="text-muted-foreground py-2 text-right text-xs">
                    {{ group.items.length }} ligne(s)
                  </td>
                </tr>
                <tr v-for="item in group.items" :key="item.key" class="border-t">
                  <td class="text-muted-foreground py-2 pr-3 pl-2">
                    {{ group.label }}
                  </td>
                  <td class="py-2 pr-3 font-semibold">{{ item.product_name }}</td>
                  <td class="text-muted-foreground py-2 pr-3">
                    {{ item.variants }}
                  </td>
                  <td class="t-num py-2 pr-3 text-right">{{ item.total_quantity }}</td>
                  <td class="t-num py-2 text-right">{{ item.order_count }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <dl
          v-if="activeTab === 'items' && !error && !loading"
          class="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-3"
        >
          <div>
            <dt class="text-muted-foreground text-xs">Budget initial</dt>
            <dd class="t-num mt-0.5 text-xl font-semibold">
              {{ creditKnown ? formatSubtotal(initialBudget) : TO_BE_DETERMINED }}
            </dd>
          </div>
          <div>
            <dt class="text-muted-foreground text-xs">Coût total</dt>
            <dd class="t-num mt-0.5 text-xl font-semibold">
              {{ formatSubtotal(totalCosts) }}
            </dd>
          </div>
          <div>
            <dt class="text-muted-foreground text-xs">
              {{ !creditKnown || budgetDelta >= 0 ? "Restant" : "Dépassement" }}
            </dt>
            <dd v-if="!creditKnown" class="mt-0.5 text-xl font-semibold">
              {{ TO_BE_DETERMINED }}
            </dd>
            <dd
              v-else
              :class="[
                't-num mt-0.5 text-xl font-semibold',
                budgetDelta < 0 ? 'text-bordeaux' : 'text-vert',
              ]"
            >
              {{ formatSubtotal(Math.abs(budgetDelta)) }}
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <div
      class="flex flex-col gap-3 rounded-lg border p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p class="font-semibold">Mode lecture seule global</p>
        <p class="text-muted-foreground text-sm">
          {{
            isViewOnly
              ? "Activé: personne ne peut ajouter, modifier ou confirmer une commande."
              : "Désactivé: les employés peuvent commander."
          }}
        </p>
      </div>
      <Button
        size="sm"
        variant="destructive"
        class="shrink-0"
        @click="showReadonlyConfirm = true"
      >
        {{ isViewOnly ? t.viewOnlyDisable : t.viewOnlyEnable }}
      </Button>
    </div>

    <div
      v-if="showReadonlyConfirm"
      class="bg-encre/55 fixed inset-0 z-50 flex items-center justify-center px-4"
      @click.self="showReadonlyConfirm = false"
    >
      <div
        class="bg-card w-full max-w-md rounded-lg border p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <h3 class="t-h3 font-semibold">Confirmation requise</h3>
        <p class="text-muted-foreground mt-2 text-sm">
          {{
            isViewOnly
              ? "Cette action désactive le mode lecture seule global."
              : "Cette action active le mode lecture seule global."
          }}
        </p>
        <p class="text-muted-foreground mt-1 text-sm">
          {{
            isViewOnly
              ? "Les employés pourront de nouveau ajouter, modifier ou confirmer une commande."
              : "Personne n'aura accès au shop pour ajouter, modifier ou confirmer une commande."
          }}
        </p>
        <div class="mt-5 grid gap-2 sm:grid-cols-2">
          <Button variant="outline" @click="showReadonlyConfirm = false">
            Annuler
          </Button>
          <Button variant="destructive" @click="confirmToggleReadonly">
            Confirmer
          </Button>
        </div>
      </div>
    </div>

    <div
      v-if="deleteTarget"
      class="bg-encre/55 fixed inset-0 z-50 flex items-center justify-center px-4"
      @click.self="closeDeleteConfirm"
    >
      <div
        class="bg-card w-full max-w-md rounded-lg border p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <h3 class="t-h3 font-semibold">Confirmer la suppression</h3>
        <p class="text-muted-foreground mt-2 text-sm">
          Supprimer la commande de {{ deleteTarget.userName }} ?
        </p>
        <p class="text-muted-foreground mt-1 text-sm">
          Cette action est irréversible.
        </p>
        <div class="mt-5 grid gap-2 sm:grid-cols-2">
          <Button variant="outline" @click="closeDeleteConfirm">Annuler</Button>
          <Button variant="destructive" @click="confirmDeleteOrder">
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { AlertTriangle, Download, RefreshCw } from "lucide-vue-next";
import { computed, ref } from "vue";

import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";
import type { MerchCopy } from "@/config/merch-copy";
import { COMPANY_CREDIT, CREDIT_IS_SET } from "@/config/merch-store";
import {
  getSupplierName,
  SUPPLIER_IDS,
  SUPPLIERS,
  type SupplierId,
} from "@/config/suppliers";

type ItemSummary = {
  key: string;
  product_name: string;
  variants: string;
  total_quantity: number;
  order_count: number;
  /** `null`: le produit n'est plus au catalogue, fournisseur inconnu. */
  supplier: SupplierId | null;
};

type SupplierFilter = "all" | SupplierId | "unspecified";

const UNSPECIFIED_DOT = "var(--p-encre-3)";

// Tant que le crédit est à déterminer, ni le budget ni la part facturable
// ne peuvent être calculés.
const creditKnown = CREDIT_IS_SET;
const TO_BE_DETERMINED = "À déterminer";

const props = defineProps<{
  t: MerchCopy;
  isViewOnly: boolean;
  loading: boolean;
  error: string | null;
  orders: Array<{
    id: string;
    user_name: string;
    user_email: string | null;
    item_count: number;
    total_per_person: number;
    billable_per_person: number;
    is_locked: boolean;
    created_at: string;
  }>;
  itemsSummary: ItemSummary[];
}>();

const emit = defineEmits<{
  refresh: [];
  "select-order": [orderId: string];
  "delete-order": [orderId: string];
  "toggle-view-only": [];
}>();

const tabs = [
  { id: "orders", label: "Commandes" },
  { id: "items", label: "Résumé de la commande" },
] as const;

const activeTab = ref<"orders" | "items">("orders");
const supplierFilter = ref<SupplierFilter>("all");
const showReadonlyConfirm = ref(false);
const deleteTarget = ref<null | { id: string; userName: string }>(null);
const totalCosts = computed(() =>
  props.orders.reduce(
    (total, order) => total + Number(order.total_per_person || 0),
    0,
  ),
);
const initialBudget = computed(() => props.orders.length * COMPANY_CREDIT);
const budgetDelta = computed(() => initialBudget.value - totalCosts.value);

const sumQuantity = (items: ItemSummary[]) =>
  items.reduce((total, item) => total + item.total_quantity, 0);

const itemsFor = (supplier: SupplierId | null) =>
  props.itemsSummary
    .filter((item) => item.supplier === supplier)
    .sort(
      (left, right) =>
        right.total_quantity - left.total_quantity ||
        left.product_name.localeCompare(right.product_name, "fr"),
    );

const unspecifiedQuantity = computed(() => sumQuantity(itemsFor(null)));

/** Tous les groupes, dans l'ordre de config/suppliers.ts. */
const allGroups = computed(() => {
  const groups: Array<{
    id: SupplierId | "unspecified";
    label: string;
    dot: string;
    items: ItemSummary[];
    quantity: number;
  }> = SUPPLIER_IDS.map((supplier) => {
    const items = itemsFor(supplier);
    return {
      id: supplier,
      label: SUPPLIERS[supplier].name,
      dot: SUPPLIERS[supplier].dot,
      items,
      quantity: sumQuantity(items),
    };
  });

  const unspecified = itemsFor(null);
  if (unspecified.length > 0) {
    groups.push({
      id: "unspecified",
      label: getSupplierName(null),
      dot: UNSPECIFIED_DOT,
      items: unspecified,
      quantity: sumQuantity(unspecified),
    });
  }
  return groups;
});

const supplierFilters = computed(() => [
  {
    id: "all" as SupplierFilter,
    label: "Tous",
    dot: null as string | null,
    quantity: sumQuantity(props.itemsSummary),
  },
  ...allGroups.value.map((group) => ({
    id: group.id as SupplierFilter,
    label: group.label,
    dot: group.dot as string | null,
    quantity: group.quantity,
  })),
]);

const groupedItems = computed(() =>
  allGroups.value.filter(
    (group) =>
      group.items.length > 0 &&
      (supplierFilter.value === "all" || supplierFilter.value === group.id),
  ),
);

const filteredItems = computed(() =>
  groupedItems.value.flatMap((group) =>
    group.items.map((item) => ({ ...item, supplierLabel: group.label })),
  ),
);

const exportLabel = computed(() => {
  const active = allGroups.value.find(
    (group) => group.id === supplierFilter.value,
  );
  return active ? `Export CSV (${active.label})` : "Export CSV";
});

const escapeCsv = (value: string | number) => {
  const raw = String(value ?? "");
  if (raw.includes('"') || raw.includes(",") || raw.includes("\n")) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
};

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const exportItemsSummaryCsv = () => {
  const headers = [
    "Fournisseur",
    "Article",
    "Variantes",
    "Qté totale",
    "Commandes",
  ];
  const rows = filteredItems.value.map((item) => [
    item.supplierLabel,
    item.product_name,
    item.variants,
    item.total_quantity,
    item.order_count,
  ]);

  const csvLines = [headers, ...rows].map((row) =>
    row.map((cell) => escapeCsv(cell)).join(","),
  );
  const csvContent = `﻿${csvLines.join("\n")}`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const active = allGroups.value.find(
    (group) => group.id === supplierFilter.value,
  );
  const scope = active ? slugify(active.label) : "tous-fournisseurs";
  anchor.href = url;
  anchor.download = `resume-commande-${scope}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const formatSubtotal = (value: string | number) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return `${value} $`;
  }
  return `${numeric.toFixed(2)} $`;
};

const confirmToggleReadonly = () => {
  emit("toggle-view-only");
  showReadonlyConfirm.value = false;
};

const openDeleteConfirm = (id: string, userName: string) => {
  deleteTarget.value = { id, userName };
};

const closeDeleteConfirm = () => {
  deleteTarget.value = null;
};

const confirmDeleteOrder = () => {
  const orderId = deleteTarget.value?.id;
  if (!orderId) {
    return;
  }
  emit("delete-order", orderId);
  closeDeleteConfirm();
};
</script>
