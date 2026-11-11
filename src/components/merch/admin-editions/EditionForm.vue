<template>
  <form class="space-y-4" novalidate="true" @submit.prevent="submit">
    <div
      class="flex flex-col gap-3 pt-4 pb-2 sm:flex-row sm:items-center sm:justify-between"
    >
      <h1 class="t-h1">
        {{
          isNew ? "Nouvelle édition" : `Modifier l'édition ${edition.number}`
        }}
      </h1>

      <Button variant="outline" :disabled="isSaving" @click="$emit('close')">
        <ArrowLeft class="size-4" />
        Retour aux éditions
      </Button>
    </div>

    <p
      v-if="isNew && previousEditionNumber"
      class="bg-ocre-pale flex items-start gap-2 rounded-md p-3 text-sm"
      role="status"
    >
      <AlertTriangle class="text-ocre mt-0.5 size-4 shrink-0" />
      <span>
        L'édition {{ edition.number }} devient l'édition en cours dès sa
        création. Les commandes de l'édition {{ previousEditionNumber }} passent
        à l'historique et ne peuvent plus être modifiées par les employés.
      </span>
    </p>

    <div class="bg-card space-y-5 rounded-lg p-5 sm:p-6">
      <div>
        <h2 class="t-h3">{{ getEditionName(edition.number, locale) }}</h2>
        <p class="text-muted-foreground mt-1 text-sm">
          Un champ laissé vide s'affiche « À déterminer » dans la boutique.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="block text-sm font-semibold" for="edition-credit">
            Crédit par employé
          </label>
          <Input
            id="edition-credit"
            v-model="draft.credit"
            type="number"
            min="0"
            step="1"
          />
        </div>

        <div class="space-y-1.5">
          <label class="block text-sm font-semibold" for="edition-deadline">
            Date limite pour commander
          </label>
          <Input id="edition-deadline" v-model="draft.deadline" type="date" />
          <p class="text-muted-foreground text-xs">
            Jusqu'à 23 h 59, heure de Montréal.
          </p>
        </div>

        <div v-if="isCurrentEdition" class="space-y-1.5">
          <label class="flex items-center gap-2 text-sm font-semibold">
            <Checkbox v-model="draft.isOpen" />
            Commandes ouvertes
          </label>
          <p class="text-muted-foreground text-xs">
            {{
              draft.isOpen
                ? "Les employés peuvent commander jusqu'à la date limite."
                : "Personne ne peut ajouter, modifier ou confirmer une commande."
            }}
          </p>
        </div>

        <div class="space-y-1.5">
          <label class="flex items-center gap-2 text-sm font-semibold">
            <Checkbox v-model="draft.hasSuppliers" />
            Résumé de commande par fournisseur
          </label>
          <p class="text-muted-foreground text-xs">
            Le résumé admin regroupe les articles de cette édition par
            fournisseur.
          </p>
        </div>
      </div>
    </div>

    <p
      v-if="error"
      class="bg-bordeaux-pale text-bordeaux rounded-md p-3 text-sm"
      role="alert"
    >
      {{ error }}
    </p>

    <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button variant="outline" :disabled="isSaving" @click="$emit('close')">
        Annuler
      </Button>

      <Button type="submit" :disabled="isSaving">
        {{ isNew ? "Créer l'édition" : "Enregistrer l'édition" }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { AlertTriangle, ArrowLeft } from "lucide-vue-next";
import { ref } from "vue";
import { toast } from "vue-sonner";

import Button from "@/components/ui/Button.vue";
import Checkbox from "@/components/ui/Checkbox.vue";
import Input from "@/components/ui/Input.vue";
import {
  type Edition,
  getEditionName,
  toDeadlineDateInput,
  toDeadlineIso,
} from "@/config/edition";
import type { StoreLocale } from "@/types/merch";

const props = defineProps<{
  locale: StoreLocale;
  edition: Edition;
  isNew: boolean;
  isCurrentEdition: boolean;
  previousEditionNumber: number | null;
  saveEdition: (edition: Edition) => Promise<void>;
}>();

const emit = defineEmits<{
  close: [];
}>();

const draft = ref({
  credit:
    props.edition.creditPerEmployee === null
      ? ""
      : String(props.edition.creditPerEmployee),
  deadline: toDeadlineDateInput(props.edition.orderDeadline),
  isOpen: props.edition.isOpen,
  hasSuppliers: props.edition.hasSuppliers,
});
const error = ref("");
const isSaving = ref(false);

const submit = async () => {
  const credit = String(draft.value.credit).trim();
  if (credit !== "" && !(Number(credit) >= 0)) {
    error.value = "Le crédit doit être un nombre positif.";
    return;
  }
  if (isSaving.value) {
    return;
  }

  isSaving.value = true;
  error.value = "";
  try {
    await props.saveEdition({
      number: props.edition.number,
      creditPerEmployee: credit === "" ? null : Number(credit),
      orderDeadline: toDeadlineIso(draft.value.deadline),
      hasSuppliers: draft.value.hasSuppliers,
      isOpen: props.isCurrentEdition && draft.value.isOpen,
    });
    toast.success(props.isNew ? "Édition créée." : "Édition enregistrée.");
    emit("close");
  } catch (saveError) {
    console.error(saveError);
    error.value = "L'édition n'a pas pu être enregistrée. Veuillez réessayer.";
  } finally {
    isSaving.value = false;
  }
};
</script>
