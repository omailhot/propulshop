<template>
  <section class="space-y-4">
    <EditionForm
      v-if="formEdition"
      :locale="locale"
      :edition="formEdition"
      :is-new="isNewEdition"
      :is-current-edition="
        isNewEdition || formEdition.number === currentEditionNumber
      "
      :previous-edition-number="isNewEdition ? currentEditionNumber : null"
      :save-edition="isNewEdition ? addEdition : saveEdition"
      @close="formEdition = null"
    />

    <template v-else>
      <div
        class="flex flex-col gap-3 pt-4 pb-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <h1 class="t-h1">Éditions</h1>

        <Button @click="openNewEdition">
          <Plus class="size-4" />
          Nouvelle édition
        </Button>
      </div>

      <div class="bg-card rounded-lg p-4 sm:p-6">
        <p class="text-muted-foreground text-sm">
          L'édition au plus grand numéro est l'édition en cours: c'est la seule
          dans laquelle les employés commandent. Une édition qui a des commandes
          ne peut pas être supprimée.
        </p>

        <p
          v-if="editions.length === 0"
          class="text-muted-foreground mt-4 text-sm"
        >
          Aucune édition.
        </p>

        <div v-else class="mt-4 overflow-auto">
          <table class="w-full min-w-[52rem] text-sm">
            <thead>
              <tr class="text-muted-foreground text-left text-xs">
                <th class="py-2 pr-3 font-semibold">Édition</th>
                <th class="py-2 pr-3 text-right font-semibold">
                  Crédit par employé
                </th>
                <th class="py-2 pr-3 font-semibold">Date limite</th>
                <th class="py-2 pr-3 font-semibold">Commandes</th>
                <th class="py-2 pr-3 text-right font-semibold">
                  Nombre de commandes
                </th>
                <th class="py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="row in rows"
                :key="row.edition.number"
                class="border-t"
              >
                <td class="py-2.5 pr-3">
                  <span class="inline-flex items-center gap-2 font-semibold">
                    {{ row.name }}

                    <Badge v-if="row.isCurrent" variant="success">
                      En cours
                    </Badge>
                  </span>
                </td>
                <td class="t-num py-2.5 pr-3 text-right">
                  {{ row.credit ?? TO_BE_DETERMINED }}
                </td>
                <td class="py-2.5 pr-3">
                  {{ row.deadline ?? TO_BE_DETERMINED }}
                </td>
                <td class="py-2.5 pr-3">
                  <Badge
                    :variant="row.isOrderingOpen ? 'success' : 'secondary'"
                  >
                    {{ row.isOrderingOpen ? "Ouvertes" : "Fermées" }}
                  </Badge>
                </td>
                <td class="t-num py-2.5 pr-3 text-right">
                  {{ row.orderCount }}
                </td>
                <td class="py-2.5 text-right whitespace-nowrap">
                  <Button
                    size="sm"
                    variant="ghost"
                    @click="openEdition(row.edition)"
                  >
                    Modifier
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    class="text-bordeaux hover:bg-bordeaux-pale hover:text-bordeaux"
                    :disabled="!row.canDelete"
                    :title="row.deleteHint"
                    @click="deleteTarget = row.edition"
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
          Supprimer l'édition {{ deleteTarget.number }} ?
        </p>

        <p class="text-muted-foreground mt-1 text-sm">
          {{
            deleteTarget.number === currentEditionNumber
              ? "Cette action est irréversible. L'édition précédente redevient l'édition en cours, commandes fermées."
              : "Cette action est irréversible."
          }}
        </p>

        <div class="mt-5 grid gap-2 sm:grid-cols-2">
          <Button variant="outline" @click="deleteTarget = null">
            Annuler
          </Button>

          <Button
            variant="destructive"
            :disabled="isDeleting"
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
import { Plus } from "lucide-vue-next";
import { computed, ref } from "vue";
import { toast } from "vue-sonner";

import EditionForm from "@/components/merch/admin-editions/EditionForm.vue";
import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";
import {
  type Edition,
  formatCreditAmount,
  formatDeadlineDate,
  getEditionName,
  isDeadlinePassed,
} from "@/config/edition";
import type { StoreLocale } from "@/types/merch";

const TO_BE_DETERMINED = "À déterminer";

const props = defineProps<{
  locale: StoreLocale;
  editions: Edition[];
  orderCountByEdition: Map<number, number>;
  addEdition: (edition: Edition) => Promise<void>;
  saveEdition: (edition: Edition) => Promise<void>;
  removeEdition: (number: number) => Promise<void>;
}>();

const formEdition = ref<Edition | null>(null);
const isNewEdition = ref(false);
const deleteTarget = ref<Edition | null>(null);
const isDeleting = ref(false);

const currentEditionNumber = computed(
  () => props.editions[props.editions.length - 1]?.number ?? null,
);

const getDeleteHint = (orderCount: number) => {
  if (orderCount > 0) {
    return "Supprimez d'abord les commandes de cette édition.";
  }
  if (props.editions.length === 1) {
    return "La boutique a besoin d'au moins une édition.";
  }
  return undefined;
};

const rows = computed(() =>
  [...props.editions].reverse().map((edition) => {
    const orderCount = props.orderCountByEdition.get(edition.number) ?? 0;
    const deleteHint = getDeleteHint(orderCount);
    const isCurrent = edition.number === currentEditionNumber.value;
    return {
      edition,
      name: getEditionName(edition.number, props.locale),
      isCurrent,
      credit: formatCreditAmount(edition.creditPerEmployee, props.locale),
      deadline: formatDeadlineDate(edition.orderDeadline, props.locale, "long"),
      isOrderingOpen: isCurrent && edition.isOpen && !isDeadlinePassed(edition),
      orderCount,
      canDelete: deleteHint === undefined,
      deleteHint,
    };
  }),
);

const openNewEdition = () => {
  isNewEdition.value = true;
  formEdition.value = {
    number: (currentEditionNumber.value ?? 0) + 1,
    creditPerEmployee: null,
    orderDeadline: null,
    hasSuppliers: true,
    isOpen: false,
  };
};

const openEdition = (edition: Edition) => {
  isNewEdition.value = false;
  formEdition.value = edition;
};

const confirmDelete = async () => {
  const edition = deleteTarget.value;
  if (!edition) {
    return;
  }
  isDeleting.value = true;
  try {
    await props.removeEdition(edition.number);
    deleteTarget.value = null;
    toast.success("Édition supprimée.");
  } catch (error) {
    console.error(error);
    toast.error("L'édition n'a pas pu être supprimée. Veuillez réessayer.");
  } finally {
    isDeleting.value = false;
  }
};
</script>
