<template>
  <section class="ml-auto mr-auto mt-5 flex min-h-[calc(80vh-12rem)] w-full max-w-7xl flex-col items-center justify-center gap-6 px-4">
    <Card class="mx-auto max-w-xl shadow-md">
      <CardHeader class="text-center">
        <CardTitle class="text-center">{{ t.placedPageTitle }}</CardTitle>
        <CardDescription class="mx-auto max-w-x">{{ t.placedPageBody }}</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div v-if="recapLines.length > 0" class="rounded-xl border bg-muted/20 p-3">
          <p class="mb-2 text-sm font-medium">Résumé des articles commandés</p>
          <ul class="space-y-1 text-sm text-muted-foreground">
            <li v-for="line in recapLines" :key="line.id">
              {{ line.product.name[locale] }} x{{ line.quantity }}
            </li>
          </ul>
          <p v-if="remainingCount > 0" class="mt-2 text-xs text-muted-foreground">
            +{{ remainingCount }} autre(s) article(s)
          </p>
        </div>
        <div class="mx-auto grid max-w-md gap-2 sm:grid-cols-2">
          <Button variant="outline" :disabled="lockActionBusy" @click="$emit('unlock-and-back')">
            {{ t.unlockOrder }}
          </Button>
          <Button @click="$emit('back')">{{ t.backToCatalog }}</Button>
        </div>
      </CardContent>
    </Card>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

import Button from "@/components/ui/Button.vue";
import Card from "@/components/ui/Card.vue";
import CardContent from "@/components/ui/CardContent.vue";
import CardDescription from "@/components/ui/CardDescription.vue";
import CardHeader from "@/components/ui/CardHeader.vue";
import CardTitle from "@/components/ui/CardTitle.vue";
import type { MerchCopy } from "@/config/merch-copy";
import type { StoreLocale } from "@/types/merch";

const props = defineProps<{
  t: MerchCopy;
  locale: StoreLocale;
  cartLines: Array<{
    id: string;
    quantity: number;
    product: {
      name: Record<StoreLocale, string>;
    };
  }>;
  deadlineLabel: string;
  lockActionBusy?: boolean;
}>();

defineEmits<{
  back: [];
  "unlock-and-back": [];
}>();

const recapLines = computed(() => props.cartLines.slice(0, 4));
const remainingCount = computed(() =>
  Math.max(props.cartLines.length - recapLines.value.length, 0),
);
</script>
