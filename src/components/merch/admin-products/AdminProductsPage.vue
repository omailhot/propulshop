<template>
  <section class="space-y-4">
    <ProductForm
      v-if="isFormOpen"
      :locale="locale"
      :product="editedProduct"
      :is-duplicate="isDuplicate"
      :products="products"
      :suppliers="suppliers"
      :save-product="saveProduct"
      @close="closeForm"
    />

    <template v-else>
      <div
        class="flex flex-col gap-3 pt-4 pb-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <h1 class="t-h1">Articles</h1>

        <Button @click="openForm(null)">
          <Plus class="size-4" />
          Nouvel article
        </Button>
      </div>

      <div class="bg-card rounded-lg p-4 sm:p-6">
        <p
          v-if="hasLoadFailed"
          class="bg-bordeaux-pale text-bordeaux mb-4 rounded-md p-3 text-sm"
          role="alert"
        >
          Le catalogue n'a pas pu être chargé. Vérifiez que
          database/neon-schema.sql et database/seed-products.sql ont été
          exécutés.
        </p>

        <SegmentedControl
          v-model="statusFilter"
          label="Filtrer par statut"
          :options="statusFilters"
        />

        <p
          v-if="filteredProducts.length === 0"
          class="text-muted-foreground mt-4 text-sm"
        >
          Aucun article.
        </p>

        <p v-else class="text-muted-foreground mt-4 text-xs">
          Glissez la poignée d'un article, ou utilisez les flèches haut et bas
          du clavier, pour changer son ordre dans la boutique.
        </p>

        <div v-if="filteredProducts.length > 0" class="mt-2 overflow-auto">
          <table class="w-full min-w-[60rem] text-sm">
            <thead>
              <tr class="text-muted-foreground text-left text-xs">
                <th class="py-2" />
                <th class="py-2 pr-3 font-semibold">Article</th>
                <th class="py-2 pr-3 font-semibold">Catégorie</th>
                <th class="py-2 pr-3 font-semibold">Fournisseur</th>
                <th class="py-2 pr-3 text-right font-semibold">Prix</th>
                <th class="py-2 pr-3 font-semibold">Statut</th>
                <th class="py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="product in filteredProducts"
                :key="product.id"
                :class="[
                  'border-t transition-colors',
                  dropTargetId === product.id ? 'bg-secondary' : '',
                  draggedProduct?.id === product.id ? 'opacity-50' : '',
                ]"
                @dragover="onDragOver($event, product)"
                @drop.prevent="onDrop(product)"
              >
                <td class="py-2.5 pr-1">
                  <button
                    type="button"
                    draggable="true"
                    class="text-muted-foreground hover:text-foreground focus-visible:ring-ring/40 inline-flex size-8 cursor-grab items-center justify-center rounded-md outline-none focus-visible:ring-[3px] active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50"
                    :aria-label="`Déplacer ${product.name[locale]}`"
                    :disabled="isReordering"
                    @dragstart="onDragStart($event, product)"
                    @dragend="onDragEnd"
                    @keydown.up.prevent="moveByKeyboard(product, -1)"
                    @keydown.down.prevent="moveByKeyboard(product, 1)"
                  >
                    <GripVertical class="size-4" />
                  </button>
                </td>
                <td class="py-2.5 pr-3">
                  <div class="flex items-center gap-3">
                    <div
                      class="size-12 shrink-0 overflow-hidden rounded-md border bg-white"
                    >
                      <img
                        v-if="getPrimaryImage(product)"
                        :src="getPrimaryImage(product) ?? ''"
                        :alt="product.name[locale]"
                        class="size-full object-contain p-0.5"
                        loading="lazy"
                      />

                      <div
                        v-else
                        class="matiere size-full"
                        aria-hidden="true"
                      />
                    </div>

                    <div class="min-w-0">
                      <p class="font-semibold">{{ product.name[locale] }}</p>
                      <p class="text-muted-foreground text-xs">
                        {{ product.id }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="text-muted-foreground py-2.5 pr-3">
                  {{ categoryLabels[product.category] }}
                </td>
                <td class="text-muted-foreground py-2.5 pr-3">
                  <a
                    v-if="product.supplier && product.supplierUrl"
                    :href="product.supplierUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="hover:text-ocre inline-flex items-center gap-1.5"
                  >
                    {{ product.supplier }}
                    <ExternalLink class="size-3.5" aria-hidden="true" />
                  </a>

                  <template v-else>{{ product.supplier ?? "-" }}</template>
                </td>
                <td class="t-num py-2.5 pr-3 text-right">
                  {{ formatCurrency.format(product.price) }}
                </td>
                <td class="py-2.5 pr-3">
                  <Badge :variant="product.isActive ? 'success' : 'secondary'">
                    {{ product.isActive ? "Affiché" : "Masqué" }}
                  </Badge>
                </td>
                <td class="py-2.5 text-right whitespace-nowrap">
                  <Button
                    size="sm"
                    variant="ghost"
                    :disabled="busyProductId === product.id"
                    @click="toggleVisibility(product)"
                  >
                    {{ product.isActive ? "Masquer" : "Afficher" }}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    @click="openForm(product, true)"
                  >
                    Dupliquer
                  </Button>

                  <Button size="sm" variant="ghost" @click="openForm(product)">
                    Modifier
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    class="text-bordeaux hover:bg-bordeaux-pale hover:text-bordeaux"
                    @click="deleteTarget = product"
                  >
                    Supprimer
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <div
      v-if="deleteTarget"
      class="bg-encre/55 fixed inset-0 z-50 flex items-center justify-center px-4"
      @click.self="deleteTarget = null"
    >
      <div
        class="bg-card w-full max-w-md rounded-lg border p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <h3 class="t-h3 font-semibold">Confirmer la suppression</h3>

        <p class="text-muted-foreground mt-2 text-sm">
          Supprimer l'article « {{ deleteTarget.name[locale] }} » ?
        </p>

        <p class="text-muted-foreground mt-1 text-sm">
          Cette action est irréversible. Les commandes passées gardent le nom de
          l'article, mais perdent son image. Pour le retirer de la boutique sans
          rien perdre, masquez-le plutôt.
        </p>

        <div class="mt-5 grid gap-2 sm:grid-cols-2">
          <Button variant="outline" @click="deleteTarget = null">
            Annuler
          </Button>

          <Button
            variant="destructive"
            :disabled="busyProductId === deleteTarget.id"
            @click="confirmDelete"
          >
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ExternalLink, GripVertical, Plus } from "lucide-vue-next";
import { computed, ref } from "vue";
import { toast } from "vue-sonner";

import ProductForm from "@/components/merch/admin-products/ProductForm.vue";
import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import { CATEGORY_LABELS } from "@/config/merch-copy";
import { getPrimaryImage } from "@/lib/product-images";
import type { Product, StoreLocale } from "@/types/merch";

type StatusFilter = "all" | "active" | "hidden";

const SAVE_ERROR = "L'article n'a pas pu être enregistré. Veuillez réessayer.";

const props = defineProps<{
  locale: StoreLocale;
  products: Product[];
  suppliers: string[];
  formatCurrency: Intl.NumberFormat;
  hasLoadFailed: boolean;
  saveProduct: (product: Product, isNew: boolean) => Promise<void>;
  removeProduct: (product: Product) => Promise<void>;
  reorderProducts: (orderedIds: string[]) => Promise<void>;
}>();

const statusFilter = ref<StatusFilter>("all");
const isFormOpen = ref(false);
const editedProduct = ref<Product | null>(null);
const isDuplicate = ref(false);
const draggedProduct = ref<Product | null>(null);
const dropTargetId = ref<string | null>(null);
const isReordering = ref(false);
const deleteTarget = ref<Product | null>(null);
const busyProductId = ref<string | null>(null);

const categoryLabels = computed(() => CATEGORY_LABELS[props.locale]);
const activeProducts = computed(() =>
  props.products.filter((product) => product.isActive),
);
const hiddenProducts = computed(() =>
  props.products.filter((product) => !product.isActive),
);
const statusFilters = computed<
  Array<{ id: StatusFilter; label: string; count: number }>
>(() => [
  { id: "all", label: "Tous", count: props.products.length },
  { id: "active", label: "Affichés", count: activeProducts.value.length },
  { id: "hidden", label: "Masqués", count: hiddenProducts.value.length },
]);
const filteredProducts = computed(() => {
  if (statusFilter.value === "active") {
    return activeProducts.value;
  }
  if (statusFilter.value === "hidden") {
    return hiddenProducts.value;
  }
  return [...activeProducts.value, ...hiddenProducts.value];
});

const openForm = (product: Product | null, asDuplicate = false) => {
  editedProduct.value = product;
  isDuplicate.value = asDuplicate;
  isFormOpen.value = true;
};

const closeForm = () => {
  isFormOpen.value = false;
  editedProduct.value = null;
  isDuplicate.value = false;
};

const canDropOn = (target: Product) =>
  draggedProduct.value !== null &&
  draggedProduct.value.id !== target.id &&
  draggedProduct.value.isActive === target.isActive;

const moveProduct = async (moved: Product, target: Product) => {
  const orderedIds = props.products.map((product) => product.id);
  const fromIndex = orderedIds.indexOf(moved.id);
  const targetIndex = orderedIds.indexOf(target.id);
  orderedIds.splice(fromIndex, 1);
  orderedIds.splice(targetIndex, 0, moved.id);

  isReordering.value = true;
  try {
    await props.reorderProducts(orderedIds);
  } catch (error) {
    console.error(error);
    toast.error("L'ordre n'a pas pu être enregistré. Veuillez réessayer.");
  } finally {
    isReordering.value = false;
  }
};

const onDragStart = (event: DragEvent, product: Product) => {
  draggedProduct.value = product;
  const row = (event.currentTarget as HTMLElement).closest("tr");
  if (event.dataTransfer && row) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setDragImage(row, 0, 0);
  }
};

const onDragOver = (event: DragEvent, target: Product) => {
  if (!canDropOn(target)) {
    return;
  }
  event.preventDefault();
  dropTargetId.value = target.id;
};

const onDragEnd = () => {
  draggedProduct.value = null;
  dropTargetId.value = null;
};

const onDrop = (target: Product) => {
  const moved = draggedProduct.value;
  if (moved && canDropOn(target)) {
    void moveProduct(moved, target);
  }
  onDragEnd();
};

const moveByKeyboard = (product: Product, offset: number) => {
  const siblings = product.isActive
    ? activeProducts.value
    : hiddenProducts.value;
  const target = siblings[siblings.indexOf(product) + offset];
  if (target && !isReordering.value) {
    void moveProduct(product, target);
  }
};

const toggleVisibility = async (product: Product) => {
  busyProductId.value = product.id;
  try {
    await props.saveProduct({ ...product, isActive: !product.isActive }, false);
    toast.success(product.isActive ? "Article masqué." : "Article affiché.");
  } catch (error) {
    console.error(error);
    toast.error(SAVE_ERROR);
  } finally {
    busyProductId.value = null;
  }
};

const confirmDelete = async () => {
  const product = deleteTarget.value;
  if (!product) {
    return;
  }
  busyProductId.value = product.id;
  try {
    await props.removeProduct(product);
    deleteTarget.value = null;
    toast.success("Article supprimé.");
  } catch (error) {
    console.error(error);
    toast.error("L'article n'a pas pu être supprimé. Veuillez réessayer.");
  } finally {
    busyProductId.value = null;
  }
};
</script>
