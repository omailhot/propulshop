<template>
  <!--
    Le résultat: la partie la plus sobre de l'écran. Fond clair, chiffres
    tabulaires, aucune texture.
  -->
  <div :class="flat ? '' : 'bg-secondary/60 rounded-lg border p-4'">
    <CreditMeter
      v-if="creditKnown"
      :label="t.creditMeterLabel"
      :credit-used="creditUsed"
      :credit-total="creditTotal"
      :format-currency="formatCurrency"
    />

    <dl :class="['space-y-2 text-sm', creditKnown ? 'mt-4' : '']">
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
        <!-- Crédit à déterminer: on l'écrit, on ne calcule rien avec. -->
        <dd v-if="!creditKnown" class="text-muted-foreground">
          {{ t.toBeDetermined }}
        </dd>
        <dd v-else class="t-num text-vert">
          {{
            creditUsed > 0
              ? `-${formatCurrency.format(creditUsed)}`
              : formatCurrency.format(creditUsed)
          }}
        </dd>
      </div>
      <div v-if="creditKnown" class="flex items-center justify-between gap-3">
        <dt class="text-muted-foreground">{{ t.creditRemaining }}</dt>
        <dd class="t-num">{{ formatCurrency.format(creditRemaining) }}</dd>
      </div>
      <div
        class="flex items-center justify-between gap-3 border-t pt-2 text-[15px]"
      >
        <dt class="font-semibold">{{ t.walletToPay }}</dt>
        <dd v-if="!creditKnown" class="font-semibold">
          {{ t.toBeDetermined }}
        </dd>
        <dd v-else class="t-num font-semibold">
          {{ formatCurrency.format(walletToPay) }}
        </dd>
      </div>
    </dl>

    <template v-if="!readOnly">
      <Button
        class="mt-4 w-full"
        size="lg"
        :disabled="isEmpty"
        @click="$emit('continue-checkout')"
      >
        {{ t.continueSelection }}
        <ArrowRight class="size-4" />
      </Button>
      <p v-if="showHint" class="text-muted-foreground mt-2 text-xs">
        {{ t.checkoutHint }}
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, CircleHelp } from "lucide-vue-next";

import CreditMeter from "@/components/merch/CreditMeter.vue";
import Button from "@/components/ui/Button.vue";
import Tooltip from "@/components/ui/Tooltip.vue";
import type { MerchCopy } from "@/config/merch-copy";

withDefaults(
  defineProps<{
    t: MerchCopy;
    subtotal: number;
    creditUsed: number;
    creditRemaining: number;
    walletToPay: number;
    formatCurrency: Intl.NumberFormat;
    isEmpty: boolean;
    readOnly?: boolean;
    showHint?: boolean;
    creditTotal: number;
    /** `false` tant que le montant du crédit est à déterminer. */
    creditKnown: boolean;
    /** Sans cadre: quand le parent fournit déjà la surface (tiroir du panier). */
    flat?: boolean;
  }>(),
  {
    readOnly: false,
    showHint: false,
    flat: false,
  },
);

defineEmits<{
  "continue-checkout": [];
}>();
</script>
