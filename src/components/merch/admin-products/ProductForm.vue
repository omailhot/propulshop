<template>
  <form class="space-y-4" novalidate="true" @submit.prevent="submit">
    <div
      class="flex flex-col gap-3 pt-4 pb-2 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="t-h1">
        {{ title }}
      </h1>

      <Button variant="outline" :disabled="isSaving" @click="$emit('close')">
        <ArrowLeft class="size-4" />
        Retour aux articles
      </Button>
    </div>

    <div class="bg-card space-y-5 rounded-lg p-5 sm:p-6">
      <h2 class="t-h3">Détails</h2>

      <div class="grid gap-4 sm:grid-cols-2">
        <div :class="fieldGroupClass">
          <label :class="labelClass" for="product-name-fr">Nom</label>
          <Input
            id="product-name-fr"
            v-model="draft.nameFr"
            @update:model-value="syncIdWithName"
          />
        </div>

        <div :class="fieldGroupClass">
          <label :class="labelClass" for="product-name-en">
            Nom en anglais
            <span :class="optionalClass">(facultatif)</span>
          </label>
          <Input id="product-name-en" v-model="draft.nameEn" />
        </div>

        <div :class="fieldGroupClass">
          <label :class="labelClass" for="product-id">Identifiant</label>
          <Input
            id="product-id"
            v-model="draft.id"
            :disabled="!isNew"
            @update:model-value="isIdEdited = true"
          />
          <p :class="hintClass">
            {{
              isNew
                ? "Sert de référence dans les commandes. Il ne peut plus changer ensuite."
                : "L'identifiant ne peut pas changer: les commandes y font référence."
            }}
          </p>
        </div>

        <div :class="fieldGroupClass">
          <label :class="labelClass" for="product-category">Catégorie</label>
          <select
            id="product-category"
            v-model="draft.category"
            :class="controlClass"
          >
            <option
              v-for="category in PRODUCT_CATEGORIES"
              :key="category"
              :value="category"
            >
              {{ categoryLabels[category] }}
            </option>
          </select>
        </div>

        <div :class="fieldGroupClass">
          <label :class="labelClass" for="product-supplier">
            Fournisseur
            <span :class="optionalClass">(facultatif)</span>
          </label>
          <Input
            id="product-supplier"
            v-model="draft.supplier"
            list="product-supplier-list"
          />
          <datalist id="product-supplier-list">
            <option
              v-for="supplier in suppliers"
              :key="supplier"
              :value="supplier"
            />
          </datalist>
        </div>

        <div :class="fieldGroupClass">
          <label :class="labelClass" for="product-supplier-url">
            Lien du fournisseur
            <span :class="optionalClass">(facultatif)</span>
          </label>
          <Input
            id="product-supplier-url"
            v-model="draft.supplierUrl"
            type="url"
            placeholder="https://"
          />
          <p :class="hintClass">
            La page de l'article chez le fournisseur. Elle suit l'article dans
            le résumé de commande et son export.
          </p>
        </div>

        <div :class="fieldGroupClass">
          <label :class="labelClass" for="product-cost">
            Coût avant taxes
            <span :class="optionalClass">(facultatif)</span>
          </label>
          <Input
            id="product-cost"
            v-model="draft.cost"
            type="number"
            min="0"
            step="0.01"
            @update:model-value="applyCostToPrice"
          />
          <p :class="hintClass">
            Le prix se calcule à partir du coût: TPS et TVQ (14,975 %), arrondi
            au dollar supérieur.
          </p>
        </div>

        <div :class="fieldGroupClass">
          <label :class="labelClass" for="product-price">Prix</label>
          <Input
            id="product-price"
            v-model="draft.price"
            type="number"
            min="0"
            step="1"
          />
          <p :class="hintClass">
            Prix unitaire en dollars, taxes comprises. Il reste modifiable après
            le calcul.
          </p>
        </div>

        <label class="flex items-center gap-2 self-start text-sm sm:mt-7">
          <Checkbox v-model="draft.isActive" />
          Affiché sur le site
        </label>
      </div>

      <div :class="fieldGroupClass">
        <label :class="labelClass" for="product-description-fr">
          Description
        </label>
        <textarea
          id="product-description-fr"
          v-model="draft.descriptionFr"
          rows="5"
          :class="textareaClass"
        />
        <p :class="hintClass">
          Markdown simple: paragraphes, listes avec « - », **gras**, *italique*.
        </p>
      </div>

      <div :class="fieldGroupClass">
        <label :class="labelClass" for="product-description-en">
          Description en anglais
          <span :class="optionalClass">(facultatif)</span>
        </label>
        <textarea
          id="product-description-en"
          v-model="draft.descriptionEn"
          rows="3"
          :class="textareaClass"
        />
      </div>
    </div>

    <div class="bg-card space-y-5 rounded-lg p-5 sm:p-6">
      <div
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 class="t-h3">Options</h2>
          <p class="text-muted-foreground mt-1 text-sm">
            Les choix offerts à l'employé: couleurs, tailles ou autre.
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <Button
            v-for="groupType in availableGroupTypes"
            :key="groupType.type"
            size="sm"
            variant="outline"
            @click="addGroup(groupType.type)"
          >
            <Plus class="size-4" />
            {{ groupType.label }}
          </Button>
        </div>
      </div>

      <p v-if="draft.groups.length === 0" class="text-muted-foreground text-sm">
        Aucune option: l'article s'ajoute au panier tel quel.
      </p>

      <fieldset
        v-for="group in draft.groups"
        :key="group.key"
        class="space-y-3 rounded-lg border p-4"
      >
        <div class="flex flex-wrap items-end gap-3">
          <div :class="[fieldGroupClass, 'min-w-40 flex-1']">
            <label :class="labelClass" :for="`group-fr-${group.key}`">
              Nom de l'option
            </label>
            <Input :id="`group-fr-${group.key}`" v-model="group.labelFr" />
          </div>

          <div :class="[fieldGroupClass, 'min-w-40 flex-1']">
            <label :class="labelClass" :for="`group-en-${group.key}`">
              En anglais
              <span :class="optionalClass">(facultatif)</span>
            </label>
            <Input :id="`group-en-${group.key}`" v-model="group.labelEn" />
          </div>

          <Button
            size="sm"
            variant="ghost"
            class="text-bordeaux hover:bg-bordeaux-pale hover:text-bordeaux"
            @click="removeGroup(group.key)"
          >
            Retirer l'option
          </Button>
        </div>

        <div class="overflow-auto">
          <table class="w-full min-w-[38rem] text-sm">
            <thead>
              <tr class="text-muted-foreground text-left text-xs">
                <th
                  v-if="group.type === 'color'"
                  class="py-1 pr-2 font-semibold"
                >
                  Teinte
                </th>
                <th class="py-1 pr-2 font-semibold">Choix</th>
                <th class="py-1 pr-2 font-semibold">En anglais</th>
                <th class="py-1 pr-2 font-semibold">Nom chez le fournisseur</th>
                <th class="py-1 pr-2 font-semibold">Écart de prix</th>
                <th class="py-1" />
              </tr>
            </thead>

            <tbody>
              <tr v-for="option in group.options" :key="option.key">
                <td v-if="group.type === 'color'" class="py-1 pr-2">
                  <input
                    v-model="option.swatchHex"
                    type="color"
                    class="border-input size-9 cursor-pointer rounded-md border bg-transparent p-1"
                    :aria-label="`Teinte de ${option.labelFr || 'la couleur'}`"
                  />
                </td>
                <td class="py-1 pr-2">
                  <Input v-model="option.labelFr" aria-label="Nom du choix" />
                </td>
                <td class="py-1 pr-2">
                  <Input
                    v-model="option.labelEn"
                    aria-label="Nom du choix en anglais"
                  />
                </td>
                <td class="py-1 pr-2">
                  <Input
                    v-model="option.supplierLabel"
                    aria-label="Nom du choix chez le fournisseur"
                  />
                </td>
                <td class="py-1 pr-2">
                  <Input
                    v-model="option.priceDelta"
                    type="number"
                    step="1"
                    placeholder="0"
                    aria-label="Écart de prix"
                  />
                </td>
                <td class="py-1 text-right">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    :aria-label="`Retirer ${option.labelFr || 'le choix'}`"
                    @click="removeOption(group, option.key)"
                  >
                    <Trash2 class="size-4" />
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Button size="sm" variant="outline" @click="addOption(group)">
          <Plus class="size-4" />
          Ajouter un choix
        </Button>
      </fieldset>
    </div>

    <div class="bg-card space-y-5 rounded-lg p-5 sm:p-6">
      <div
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 class="t-h3">Images</h2>
          <p class="text-muted-foreground mt-1 text-sm">
            La première image sert de vignette. Une image liée à un choix
            s'affiche quand ce choix est sélectionné.
          </p>
        </div>

        <Button size="sm" variant="outline" @click="fileInput?.click()">
          <Upload class="size-4" />
          Téléverser des images
        </Button>

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple="true"
          class="hidden"
          @change="onFilesSelected"
        />
      </div>

      <div class="flex flex-wrap items-end gap-2">
        <div :class="[fieldGroupClass, 'min-w-60 flex-1']">
          <label :class="labelClass" for="product-image-url">
            Ou ajouter une image par son adresse
          </label>
          <Input
            id="product-image-url"
            v-model="imageUrl"
            placeholder="https://"
            @keydown.enter.prevent="addImageUrl"
          />
        </div>

        <Button
          variant="outline"
          :disabled="!imageUrl.trim()"
          @click="addImageUrl"
        >
          Ajouter
        </Button>
      </div>

      <p v-if="draft.images.length === 0" class="text-muted-foreground text-sm">
        Aucune image.
      </p>

      <ul v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="(image, index) in draft.images"
          :key="image.key"
          class="space-y-2 rounded-lg border p-3"
        >
          <div class="aspect-square overflow-hidden rounded-md bg-white">
            <img
              :src="image.previewUrl || resolveImageSrc(image.src)"
              alt=""
              class="size-full object-contain"
            />
          </div>

          <select
            v-if="!image.combinedWhen"
            v-model="image.optionKey"
            :class="controlClass"
            aria-label="Choix illustré par l'image"
          >
            <option value="">Toutes les variantes</option>
            <option
              v-for="choice in imageChoices"
              :key="choice.key"
              :value="choice.key"
            >
              {{ choice.label }}
            </option>
          </select>

          <p v-else :class="hintClass">
            Liée à une combinaison de choix:
            {{ Object.values(image.combinedWhen).join(" + ") }}
          </p>

          <div class="flex items-center justify-between">
            <div class="flex gap-1">
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Déplacer l'image vers le début"
                :disabled="index === 0"
                @click="moveImage(index, -1)"
              >
                <ChevronLeft class="size-4" />
              </Button>

              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Déplacer l'image vers la fin"
                :disabled="index === draft.images.length - 1"
                @click="moveImage(index, 1)"
              >
                <ChevronRight class="size-4" />
              </Button>
            </div>

            <Button
              size="sm"
              variant="ghost"
              class="text-bordeaux hover:bg-bordeaux-pale hover:text-bordeaux"
              @click="removeImage(image.key)"
            >
              Retirer
            </Button>
          </div>
        </li>
      </ul>
    </div>

    <ul
      v-if="errors.length > 0"
      class="bg-bordeaux-pale text-bordeaux space-y-1 rounded-md p-3 text-sm"
      role="alert"
    >
      <li v-for="error in errors" :key="error">{{ error }}</li>
    </ul>

    <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button variant="outline" :disabled="isSaving" @click="$emit('close')">
        Annuler
      </Button>

      <Button type="submit" :disabled="isSaving">
        {{ isSaving ? "Enregistrement..." : "Enregistrer l'article" }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Upload,
} from "lucide-vue-next";
import { computed, onUnmounted, ref } from "vue";
import { toast } from "vue-sonner";

import Button from "@/components/ui/Button.vue";
import Checkbox from "@/components/ui/Checkbox.vue";
import Input from "@/components/ui/Input.vue";
import { CATEGORY_LABELS } from "@/config/merch-copy";
import { PRODUCT_CATEGORIES } from "@/config/merch-store";
import { isDbImage, resolveImageSrc } from "@/lib/image-store";
import { getPriceWithTaxes } from "@/lib/pricing";
import {
  createGroupDraft,
  createImageDraft,
  createOptionDraft,
  createProductDraft,
  type GroupDraft,
  toDuplicateDraft,
  toProduct,
  toProductDraft,
  validateProductDraft,
} from "@/lib/product-draft";
import {
  copyProductImage,
  deleteProductImages,
  uploadProductImage,
} from "@/lib/product-repository";
import { slugify } from "@/lib/utils";
import type { Product, ProductVariantGroup, StoreLocale } from "@/types/merch";

const GROUP_TYPES: Array<{
  type: ProductVariantGroup["type"];
  label: string;
  isUnique: boolean;
}> = [
  { type: "color", label: "Couleurs", isUnique: true },
  { type: "size", label: "Tailles", isUnique: true },
  { type: "select", label: "Autre option", isUnique: false },
];

const fieldGroupClass = "space-y-1.5";
const labelClass = "block text-sm font-semibold";
const optionalClass = "text-muted-foreground font-normal";
const hintClass = "text-muted-foreground text-xs";
const controlBaseClass =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full min-w-0 rounded-md border bg-transparent px-3 text-base shadow-xs outline-none focus-visible:ring-[3px]";
const controlClass = `${controlBaseClass} h-9`;
const textareaClass = `${controlBaseClass} py-2`;

const props = defineProps<{
  locale: StoreLocale;
  product: Product | null;
  isDuplicate: boolean;
  products: Product[];
  suppliers: string[];
  saveProduct: (product: Product, isNew: boolean) => Promise<void>;
}>();

const emit = defineEmits<{
  close: [];
}>();

const isNew = props.product === null || props.isDuplicate;
const title = props.isDuplicate
  ? "Dupliquer l'article"
  : isNew
    ? "Nouvel article"
    : "Modifier l'article";

const createDraft = () => {
  if (!props.product) {
    return createProductDraft(props.products);
  }
  return props.isDuplicate
    ? toDuplicateDraft(props.product, props.products)
    : toProductDraft(props.product);
};

const draft = ref(createDraft());
const errors = ref<string[]>([]);
const isSaving = ref(false);
const isIdEdited = ref(false);
const imageUrl = ref("");
const fileInput = ref<HTMLInputElement | null>(null);
const previewUrls: string[] = [];

const categoryLabels = computed(() => CATEGORY_LABELS[props.locale]);
const availableGroupTypes = computed(() =>
  GROUP_TYPES.filter(
    (groupType) =>
      !groupType.isUnique ||
      !draft.value.groups.some((group) => group.type === groupType.type),
  ),
);
const imageChoices = computed(() =>
  draft.value.groups.flatMap((group) =>
    group.options
      .filter((option) => option.labelFr.trim())
      .map((option) => ({
        key: option.key,
        label: `${group.labelFr.trim() || "Option"}: ${option.labelFr.trim()}`,
      })),
  ),
);

const syncIdWithName = () => {
  if (isNew && !isIdEdited.value) {
    draft.value.id = slugify(draft.value.nameFr);
  }
};

const applyCostToPrice = (value: string) => {
  const cost = Number(value);
  if (value.trim() !== "" && Number.isFinite(cost) && cost >= 0) {
    draft.value.price = String(getPriceWithTaxes(cost));
  }
};

const addGroup = (type: ProductVariantGroup["type"]) => {
  draft.value.groups.push(createGroupDraft(type));
};

const removeGroup = (groupKey: string) => {
  draft.value.groups = draft.value.groups.filter(
    (group) => group.key !== groupKey,
  );
};

const addOption = (group: GroupDraft) => {
  group.options.push(createOptionDraft());
};

const removeOption = (group: GroupDraft, optionKey: string) => {
  group.options = group.options.filter((option) => option.key !== optionKey);
};

const onFilesSelected = (event: Event) => {
  const input = event.target as HTMLInputElement;
  for (const file of Array.from(input.files ?? [])) {
    const previewUrl = URL.createObjectURL(file);
    previewUrls.push(previewUrl);
    draft.value.images.push(createImageDraft({ src: "", file, previewUrl }));
  }
  input.value = "";
};

const addImageUrl = () => {
  const src = imageUrl.value.trim();
  if (!src) {
    return;
  }
  draft.value.images.push(
    createImageDraft({ src, file: null, previewUrl: "" }),
  );
  imageUrl.value = "";
};

const moveImage = (index: number, offset: number) => {
  const [image] = draft.value.images.splice(index, 1);
  draft.value.images.splice(index + offset, 0, image);
};

const removeImage = (imageKey: string) => {
  draft.value.images = draft.value.images.filter(
    (image) => image.key !== imageKey,
  );
};

const submit = async () => {
  errors.value = validateProductDraft(
    draft.value,
    props.products.map((product) => product.id),
    isNew,
  );
  if (errors.value.length > 0 || isSaving.value) {
    return;
  }

  isSaving.value = true;
  const uploadedSources = new Map<string, string>();
  try {
    for (const image of draft.value.images) {
      if (image.file) {
        uploadedSources.set(image.key, await uploadProductImage(image.file));
      } else if (props.isDuplicate && isDbImage(image.src)) {
        uploadedSources.set(image.key, await copyProductImage(image.src));
      }
    }
    await props.saveProduct(toProduct(draft.value, uploadedSources), isNew);
    toast.success("Article enregistré.");
    emit("close");
  } catch (error) {
    console.error(error);
    await deleteProductImages([...uploadedSources.values()]).catch(
      console.error,
    );
    errors.value = [
      "L'article n'a pas pu être enregistré. Veuillez réessayer.",
    ];
  } finally {
    isSaving.value = false;
  }
};

onUnmounted(() => {
  for (const previewUrl of previewUrls) {
    URL.revokeObjectURL(previewUrl);
  }
});
</script>
