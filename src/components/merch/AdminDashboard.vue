<template>
  <section class="space-y-4">
    <div
      class="flex flex-col gap-3 pt-4 pb-2 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="t-h1">Commandes de l'édition</h1>

      <SegmentedControl
        class="self-start"
        label="Choisir l'édition"
        :options="editionOptions"
        :model-value="edition.number"
        @update:model-value="selectEdition"
      />
    </div>

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
              'focus-visible:ring-ring/40 relative cursor-pointer rounded-t-md pt-2 pb-3 text-sm font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px]',
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

          <template v-if="activeTab === 'users'">
            <Button
              size="sm"
              variant="outline"
              :disabled="usersWithoutOrder.length === 0"
              @click="copyUserEmails"
            >
              <Copy class="size-4" />
              Copier les courriels
            </Button>

            <Button
              size="sm"
              variant="outline"
              :disabled="usersWithoutOrder.length === 0"
              @click="exportUsersCsv"
            >
              <Download class="size-4" />
              Export CSV
            </Button>
          </template>

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
          v-else-if="activeTab === 'orders' && editionOrders.length === 0"
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
                <th class="py-2 pr-3 font-semibold">Statut</th>
                <th class="py-2 font-semibold">Date</th>
                <th class="py-2 pl-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="order in editionOrders"
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
                  <Badge :variant="order.is_placed ? 'success' : 'warning'">
                    {{ order.is_placed ? "Placée" : "Brouillon" }}
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

        <div v-else-if="activeTab === 'users'">
          <p class="text-muted-foreground text-sm">
            Les employés sans commande placée pour cette édition. Seuls ceux
            qui se sont connectés au moins une fois apparaissent.
          </p>

          <p
            v-if="usersWithoutOrder.length === 0"
            class="text-muted-foreground mt-4 text-sm"
          >
            Tout le monde a placé sa commande.
          </p>

          <div v-else class="mt-4 overflow-auto">
            <table class="w-full min-w-[40rem] text-sm">
              <thead>
                <tr class="text-muted-foreground text-left text-xs">
                  <th class="py-2 pr-3 font-semibold">Nom</th>
                  <th class="py-2 pr-3 font-semibold">Courriel</th>
                  <th class="py-2 pr-3 font-semibold">Statut</th>
                  <th class="py-2 font-semibold">Dernière visite</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="user in usersWithoutOrder"
                  :key="user.user_id"
                  class="border-t"
                >
                  <td class="py-2.5 pr-3 font-semibold">
                    {{ user.display_name }}
                  </td>
                  <td class="text-muted-foreground py-2.5 pr-3">
                    {{ user.email }}
                  </td>
                  <td class="py-2.5 pr-3">
                    <Badge :variant="user.has_draft ? 'warning' : 'secondary'">
                      {{ user.has_draft ? "Brouillon" : "Aucune commande" }}
                    </Badge>
                  </td>
                  <td class="text-muted-foreground t-num py-2.5">
                    {{
                      user.last_seen_at ? formatDateTime(user.last_seen_at) : "-"
                    }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ============ Résumé de la commande, par fournisseur ============ -->
        <p
          v-else-if="editionItems.length === 0"
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
                {{
                  edition.hasSuppliers
                    ? "Les articles des commandes placées, séparés par fournisseur."
                    : "Les articles des commandes placées."
                }}
              </p>
            </div>

            <SegmentedControl
              v-if="edition.hasSuppliers"
              v-model="supplierFilter"
              class="self-start"
              label="Filtrer par fournisseur"
              :options="supplierFilters"
            />
          </div>

          <p
            v-if="edition.hasSuppliers && unspecifiedQuantity > 0"
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
                  <th v-if="edition.hasSuppliers" class="py-2 pr-3 font-semibold">
                    Fournisseur
                  </th>
                  <th class="py-2 pr-3 font-semibold">Article</th>
                  <th class="py-2 pr-3 font-semibold">Variantes</th>
                  <th class="py-2 pr-3 text-right font-semibold">Quantité</th>
                  <th class="py-2 text-right font-semibold">Commandes</th>
                </tr>
              </thead>
              <tbody v-for="group in groupedItems" :key="group.id">
                <tr v-if="edition.hasSuppliers" class="bg-secondary/60 border-t">
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
                  <td
                    v-if="edition.hasSuppliers"
                    class="text-muted-foreground py-2 pr-3 pl-2"
                  >
                    {{ group.label }}
                  </td>
                  <td class="py-2 pr-3 font-semibold">
                    <a
                      v-if="item.supplier_url"
                      :href="item.supplier_url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="hover:text-ocre inline-flex items-center gap-1.5"
                    >
                      {{ item.product_name }}
                      <ExternalLink class="size-3.5" aria-hidden="true" />
                    </a>

                    <template v-else>{{ item.product_name }}</template>
                  </td>
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
import {
  AlertTriangle,
  Copy,
  Download,
  ExternalLink,
  RefreshCw,
} from "lucide-vue-next";
import { computed, ref } from "vue";
import { toast } from "vue-sonner";

import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import { type Edition, PENDING_EDITION } from "@/config/edition";
import type { MerchCopy } from "@/config/merch-copy";
import {
  getSupplierDot,
  getSupplierName,
  UNSPECIFIED_SUPPLIER_DOT,
} from "@/config/suppliers";
import { slugify } from "@/lib/utils";

type ItemSummary = {
  key: string;
  edition: number;
  product_name: string;
  variants: string;
  total_quantity: number;
  order_count: number;
  supplier: string | null;
  supplier_variants: string;
  supplier_url: string | null;
};

const ALL_SUPPLIERS = "all";
const UNSPECIFIED_SUPPLIER = "unspecified";
const TO_BE_DETERMINED = "À déterminer";

const props = defineProps<{
  t: MerchCopy;
  loading: boolean;
  error: string | null;
  orders: Array<{
    id: string;
    edition: number;
    user_id: string;
    user_name: string;
    user_email: string | null;
    item_count: number;
    total_per_person: number;
    billable_per_person: number;
    is_placed: boolean;
    created_at: string;
  }>;
  itemsSummary: ItemSummary[];
  suppliers: string[];
  editions: Edition[];
  users: Array<{
    user_id: string;
    email: string;
    display_name: string;
    last_seen_at: string | null;
  }>;
}>();

const emit = defineEmits<{
  refresh: [];
  "select-order": [orderId: string];
  "delete-order": [orderId: string];
}>();

type Tab = "orders" | "items" | "users";

const activeTab = ref<Tab>("orders");
const selectedEditionNumber = ref<number | null>(null);
const supplierFilter = ref(ALL_SUPPLIERS);
const deleteTarget = ref<null | { id: string; userName: string }>(null);

const currentEdition = computed(
  () => props.editions[props.editions.length - 1] ?? PENDING_EDITION,
);
const edition = computed(
  () =>
    props.editions.find(
      (option) => option.number === selectedEditionNumber.value,
    ) ?? currentEdition.value,
);
const creditKnown = computed(() => edition.value.creditPerEmployee !== null);
const editionOrders = computed(() =>
  props.orders.filter((order) => order.edition === edition.value.number),
);
const editionItems = computed(() =>
  props.itemsSummary.filter((item) => item.edition === edition.value.number),
);
const usersWithoutOrder = computed(() => {
  const isPlacedByUserId = new Map(
    editionOrders.value.map((order) => [order.user_id, order.is_placed]),
  );
  return props.users
    .filter((user) => !isPlacedByUserId.get(user.user_id))
    .map((user) => ({
      ...user,
      has_draft: isPlacedByUserId.has(user.user_id),
    }));
});
const tabs = computed<Array<{ id: Tab; label: string }>>(() => [
  { id: "orders", label: "Commandes" },
  { id: "items", label: "Résumé de la commande" },
  {
    id: "users",
    label: `Sans commande (${usersWithoutOrder.value.length})`,
  },
]);
const editionOptions = computed(() =>
  [...props.editions].reverse().map((option) => ({
    id: option.number,
    label: `Édition ${option.number}`,
    count: props.orders.filter((order) => order.edition === option.number)
      .length,
  })),
);
const placedOrders = computed(() =>
  editionOrders.value.filter((order) => order.is_placed),
);
const totalCosts = computed(() =>
  placedOrders.value.reduce(
    (total, order) => total + Number(order.total_per_person || 0),
    0,
  ),
);
const initialBudget = computed(
  () => placedOrders.value.length * (edition.value.creditPerEmployee ?? 0),
);
const budgetDelta = computed(() => initialBudget.value - totalCosts.value);

const selectEdition = (number: number) => {
  selectedEditionNumber.value = number;
  supplierFilter.value = ALL_SUPPLIERS;
};

const sumQuantity = (items: ItemSummary[]) =>
  items.reduce((total, item) => total + item.total_quantity, 0);

const sortItems = (items: ItemSummary[]) =>
  [...items].sort(
    (left, right) =>
      right.total_quantity - left.total_quantity ||
      left.product_name.localeCompare(right.product_name, "fr"),
  );

const itemsFor = (supplier: string | null) =>
  sortItems(editionItems.value.filter((item) => item.supplier === supplier));

const unspecifiedQuantity = computed(() => sumQuantity(itemsFor(null)));

const allGroups = computed(() => {
  if (!edition.value.hasSuppliers) {
    const items = sortItems(editionItems.value);
    return [
      {
        id: ALL_SUPPLIERS,
        label: "",
        dot: UNSPECIFIED_SUPPLIER_DOT,
        items,
        quantity: sumQuantity(items),
      },
    ];
  }

  const groups = props.suppliers.map((supplier) => {
    const items = itemsFor(supplier);
    return {
      id: supplier,
      label: supplier,
      dot: getSupplierDot(supplier, props.suppliers),
      items,
      quantity: sumQuantity(items),
    };
  });

  const unspecified = itemsFor(null);
  if (unspecified.length > 0) {
    groups.push({
      id: UNSPECIFIED_SUPPLIER,
      label: getSupplierName(null),
      dot: UNSPECIFIED_SUPPLIER_DOT,
      items: unspecified,
      quantity: sumQuantity(unspecified),
    });
  }
  return groups.filter((group) => group.items.length > 0);
});

const supplierFilters = computed(() => [
  {
    id: ALL_SUPPLIERS,
    label: "Tous",
    dot: null as string | null,
    count: sumQuantity(editionItems.value),
  },
  ...allGroups.value.map((group) => ({
    id: group.id,
    label: group.label,
    dot: group.dot as string | null,
    count: group.quantity,
  })),
]);

const groupedItems = computed(() =>
  allGroups.value.filter(
    (group) =>
      supplierFilter.value === ALL_SUPPLIERS ||
      supplierFilter.value === group.id,
  ),
);

const filteredItems = computed(() =>
  groupedItems.value.flatMap((group) =>
    group.items.map((item) => ({ ...item, supplierLabel: group.label })),
  ),
);

const activeSupplierGroup = computed(() =>
  edition.value.hasSuppliers
    ? allGroups.value.find((group) => group.id === supplierFilter.value)
    : undefined,
);

const exportLabel = computed(() =>
  activeSupplierGroup.value
    ? `Export CSV (${activeSupplierGroup.value.label})`
    : "Export CSV",
);

const escapeCsv = (value: string | number) => {
  const raw = String(value ?? "");
  if (raw.includes('"') || raw.includes(",") || raw.includes("\n")) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
};

const downloadCsv = (fileName: string, rows: Array<Array<string | number>>) => {
  const csvContent = `\uFEFF${rows
    .map((row) => row.map((cell) => escapeCsv(cell)).join(","))
    .join("\n")}`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const exportItemsSummaryCsv = () => {
  const supplierHeaders = edition.value.hasSuppliers
    ? ["Fournisseur", "Lien fournisseur"]
    : [];
  const variantHeaders = edition.value.hasSuppliers
    ? ["Variantes", "Variantes (nom du fournisseur)"]
    : ["Variantes"];
  const scope = activeSupplierGroup.value
    ? slugify(activeSupplierGroup.value.label)
    : "tous-fournisseurs";

  downloadCsv(`resume-commande-edition-${edition.value.number}-${scope}`, [
    [...supplierHeaders, "Article", ...variantHeaders, "Qté totale", "Commandes"],
    ...filteredItems.value.map((item) => [
      ...(edition.value.hasSuppliers
        ? [item.supplierLabel, item.supplier_url ?? ""]
        : []),
      item.product_name,
      item.variants,
      ...(edition.value.hasSuppliers ? [item.supplier_variants] : []),
      item.total_quantity,
      item.order_count,
    ]),
  ]);
};

const exportUsersCsv = () => {
  downloadCsv(`sans-commande-edition-${edition.value.number}`, [
    ["Nom", "Courriel", "Statut", "Dernière visite"],
    ...usersWithoutOrder.value.map((user) => [
      user.display_name,
      user.email,
      user.has_draft ? "Brouillon" : "Aucune commande",
      user.last_seen_at ? formatDateTime(user.last_seen_at) : "",
    ]),
  ]);
};

const copyUserEmails = async () => {
  try {
    await navigator.clipboard.writeText(
      usersWithoutOrder.value.map((user) => user.email).join(", "),
    );
    toast.success("Courriels copiés.");
  } catch (error) {
    console.error(error);
    toast.error("Les courriels n'ont pas pu être copiés.");
  }
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
