<template>
  <section class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
    <div class="bg-card rounded-lg border shadow-sm">
      <div class="px-5 pt-5 sm:px-6 sm:pt-6">
        <p class="t-eyebrow">{{ t.reviewTitle }}</p>
        <h1 class="t-h2 mt-2">{{ t.itemsToOrder }}</h1>
        <p class="text-muted-foreground mt-1 text-sm">{{ t.reviewSubtitle }}</p>
      </div>

      <div class="p-5 sm:p-6">
        <div
          v-if="cartLines.length === 0"
          class="border-input rounded-lg border border-dashed p-6 text-center"
        >
          <p class="font-semibold">{{ t.emptyCart }}</p>
          <p class="text-muted-foreground text-sm">{{ t.addFromCatalog }}</p>
        </div>

        <ul v-else class="space-y-3">
          <li
            v-for="line in cartLines"
            :key="line.id"
            class="rounded-lg border p-4"
          >
            <div class="flex items-start gap-4">
              <div
                class="size-20 shrink-0 overflow-hidden rounded-md border bg-white"
              >
                <img
                  v-if="getPrimaryImage(line.product, line.selectedOptions)"
                  :src="
                    getPrimaryImage(line.product, line.selectedOptions) ?? ''
                  "
                  :alt="line.product.name[locale]"
                  class="size-full object-contain p-1"
                  loading="lazy"
                />
                <div v-else class="matiere size-full" aria-hidden="true" />
              </div>
              <div
                class="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
              >
                <div class="min-w-0">
                  <p class="font-semibold break-words">
                    {{ line.product.name[locale] }}
                  </p>
                  <VariantChips
                    :chips="getVariantChips(line, locale)"
                    :fallback="t.noVariants"
                  />
                  <p
                    v-if="
                      line.product.id && isGiftCardProductId(line.product.id)
                    "
                    class="text-muted-foreground mt-0.5 text-xs"
                  >
                    {{ t.giftCardQuantityLimit }}
                  </p>
                  <p class="text-muted-foreground t-num mt-0.5 text-xs">
                    {{ t.quantity }}: {{ line.quantity }}
                  </p>
                </div>
                <div class="flex flex-col items-start gap-2.5 sm:items-end">
                  <p class="t-num font-semibold">
                    {{ formatCurrency.format(line.lineTotal) }}
                  </p>
                  <div
                    v-if="!isReadOnly"
                    class="flex flex-col items-start gap-2.5 sm:items-end"
                  >
                    <template
                      v-for="group in line.product.variantGroups ?? []"
                      :key="`${line.id}-${group.id}`"
                    >
                      <ColorSwatches
                        v-if="group.type === 'color'"
                        size="sm"
                        class="sm:justify-end"
                        :label="group.label[locale]"
                        :options="toSwatchOptions(group)"
                        :model-value="line.selectedOptions[group.id]"
                        @update:model-value="
                          (optionId) =>
                            updateVariantSelection(line, group.id, optionId)
                        "
                      />
                      <div
                        v-else
                        role="radiogroup"
                        :aria-label="group.label[locale]"
                        class="flex flex-wrap gap-1 sm:justify-end"
                      >
                        <button
                          v-for="option in group.options"
                          :key="option.id"
                          type="button"
                          role="radio"
                          :aria-checked="
                            line.selectedOptions[group.id] === option.id
                          "
                          :class="[
                            'focus-visible:ring-ring/40 inline-flex h-7 min-w-8 cursor-pointer items-center justify-center rounded-md border px-2 text-xs font-semibold transition-colors outline-none focus-visible:ring-[3px]',
                            line.selectedOptions[group.id] === option.id
                              ? 'border-foreground bg-foreground text-background'
                              : 'border-input bg-card text-foreground hover:bg-accent',
                          ]"
                          @click="
                            updateVariantSelection(line, group.id, option.id)
                          "
                        >
                          {{ option.label[locale] }}
                        </button>
                      </div>
                    </template>
                    <div class="flex items-center gap-2">
                      <QuantityStepper
                        :model-value="line.quantity"
                        :max="getMaxQuantityForProductId(line.product.id ?? '')"
                        @update:model-value="
                          (nextQuantity) =>
                            $emit('update-item-quantity', line.id, nextQuantity)
                        "
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        @click="$emit('remove-item', line.id)"
                      >
                        {{ t.removeItem }}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <aside class="xl:sticky xl:top-24 xl:self-start">
      <div class="bg-card rounded-lg border shadow-md">
        <div class="px-5 pt-5">
          <h2 class="t-h3 font-semibold">{{ t.confirmationTitle }}</h2>
          <p class="text-muted-foreground mt-2 text-sm">
            {{ t.confirmationText }}
          </p>
        </div>

        <div class="space-y-4 p-5">
          <CreditMeter
            :label="t.creditMeterLabel"
            :credit-used="creditUsed"
            :credit-total="creditTotal"
            :format-currency="formatCurrency"
          />

          <dl class="space-y-2 text-sm">
            <div class="flex items-center justify-between gap-3">
              <dt class="text-muted-foreground">{{ t.subtotal }}</dt>
              <dd class="t-num">{{ formatCurrency.format(subtotal) }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-muted-foreground inline-flex items-center gap-1">
                {{ t.creditUsed }}
                <Tooltip :content="t.creditCommitteeTooltip">
                  <CircleHelp class="size-3.5" />
                </Tooltip>
              </dt>
              <dd class="t-num text-vert">
                {{
                  creditUsed > 0
                    ? `-${formatCurrency.format(creditUsed)}`
                    : formatCurrency.format(creditUsed)
                }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-muted-foreground">{{ t.creditRemaining }}</dt>
              <dd class="t-num">{{ formatCurrency.format(creditRemaining) }}</dd>
            </div>
            <div
              class="flex items-center justify-between gap-3 border-t pt-2 text-[15px]"
            >
              <dt class="font-semibold">{{ t.invoiceLater }}</dt>
              <dd class="t-num font-semibold">
                {{ formatCurrency.format(walletToPay) }}
              </dd>
            </div>
          </dl>

          <div class="bg-ocre-pale flex items-start gap-2 rounded-md p-3 text-sm">
            <AlertTriangle class="text-ocre mt-0.5 size-4 shrink-0" />
            <span>{{ t.invoiceExplanation }}</span>
          </div>

          <div class="grid gap-2">
            <!-- Le seul bouton plein de l'écran: verrouiller la commande. -->
            <Button
              v-if="!isReadOnly"
              size="lg"
              :disabled="cartLines.length === 0 || isSubmitting"
              @click="$emit('place-order')"
            >
              <Lock class="size-4" />
              {{ t.lockOrder }}
            </Button>
            <Button
              v-if="showLockToggle && !viewOnly"
              variant="outline"
              :disabled="lockActionBusy"
              @click="$emit('toggle-lock')"
            >
              <component :is="isOrderLocked ? LockOpen : Lock" class="size-4" />
              {{ isOrderLocked ? t.unlockOrder : t.lockOrder }}
            </Button>
            <Button variant="outline" @click="$emit('back')">
              <ArrowLeft class="size-4" />
              {{ backLabel ?? t.backToCatalog }}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  </section>
</template>

<script setup lang="ts">
import {
  AlertTriangle,
  ArrowLeft,
  CircleHelp,
  Lock,
  LockOpen,
} from "lucide-vue-next";
import { computed } from "vue";

import CreditMeter from "@/components/merch/CreditMeter.vue";
import VariantChips from "@/components/merch/VariantChips.vue";
import Button from "@/components/ui/Button.vue";
import ColorSwatches from "@/components/ui/ColorSwatches.vue";
import QuantityStepper from "@/components/ui/QuantityStepper.vue";
import Tooltip from "@/components/ui/Tooltip.vue";
import type { MerchCopy } from "@/config/merch-copy";
import { COMPANY_CREDIT } from "@/config/merch-store";
import {
  getMaxQuantityForProductId,
  isGiftCardProductId,
} from "@/lib/merch-quantity";
import { getPrimaryImage } from "@/lib/product-images";
import { getVariantChips } from "@/lib/variant-labels";
import type {
  CartLineView,
  ProductVariantGroup,
  StoreLocale,
} from "@/types/merch";

const props = withDefaults(
  defineProps<{
    t: MerchCopy;
    locale: StoreLocale;
    cartLines: CartLineView[];
    subtotal: number;
    creditUsed: number;
    creditRemaining: number;
    walletToPay: number;
    formatCurrency: Intl.NumberFormat;
    isSubmitting?: boolean;
    lockActionBusy?: boolean;
    isOrderLocked: boolean;
    isLockDeadlinePassed: boolean;
    lockDeadlineLabel: string;
    orderStatusMessage: string;
    readOnly?: boolean;
    viewOnly?: boolean;
    isPlaced?: boolean;
    backLabel?: string;
    showLockToggle?: boolean;
    creditTotal?: number;
  }>(),
  { creditTotal: COMPANY_CREDIT },
);

const emit = defineEmits<{
  back: [];
  "toggle-lock": [];
  "remove-item": [cartItemId: string];
  "update-item-quantity": [cartItemId: string, nextQuantity: number];
  "update-item-variants": [
    cartItemId: string,
    nextSelectedOptions: Record<string, string>,
  ];
  "place-order": [];
}>();

const isReadOnly = computed(() => Boolean(props.readOnly || props.viewOnly));

const toSwatchOptions = (group: ProductVariantGroup) =>
  group.options.map((option) => ({
    id: option.id,
    label: option.label[props.locale],
    hex: option.swatchHex ?? "#FFFFFF",
  }));

const updateVariantSelection = (
  line: CartLineView,
  groupId: string,
  optionId: string,
) => {
  if (line.selectedOptions[groupId] === optionId) {
    return;
  }

  const nextSelectedOptions = {
    ...line.selectedOptions,
    [groupId]: optionId,
  };
  emit("update-item-variants", line.id, nextSelectedOptions);
};
</script>
