<template>
  <!--
    En-tête sobre: la marque à gauche, des liens à droite. Fond plein, pas
    de verre dépoli. Au survol, un fond discret, jamais de soulignement.
  -->
  <header class="bg-background sticky top-0 z-40 border-b">
    <div
      class="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-8"
    >
      <a
        :href="localizedHome"
        class="focus-visible:ring-ring/40 flex items-center rounded-md outline-none focus-visible:ring-[3px]"
        @click.prevent="$emit('open-home')"
      >
        <!--
          Taille minimale du wordmark: 1,5 po (144 px). En dessous, l'icône
          prend le relais.
        -->
        <img
          :src="wordmarkUrl"
          alt="Propulso"
          class="hidden h-[30px] w-[144px] shrink-0 md:block"
          width="144"
          height="30"
        />
        <img
          :src="iconUrl"
          alt="Propulso"
          class="h-8 w-auto shrink-0 md:hidden"
          width="29"
          height="32"
        />
      </a>

      <nav class="-mr-3 flex shrink-0 items-center gap-1 text-sm">
        <!-- Le crédit restant: la donnée que l'employé surveille en magasinant. -->
        <span
          v-if="showCredit && creditRemainingLabel"
          class="text-muted-foreground mr-3 hidden md:inline"
        >
          {{ creditLabel }}
          <span class="t-num text-foreground font-semibold">
            {{ creditRemainingLabel }}
          </span>
        </span>

        <template v-if="isAuthenticated">
          <button
            v-if="view !== 'orders'"
            type="button"
            :class="linkClass"
            @click="$emit('open-orders')"
          >
            {{ ordersLabel }}
          </button>

          <button
            v-if="isAdmin && !isAdminView"
            type="button"
            :class="linkClass"
            @click="$emit('open-admin')"
          >
            {{ adminLabel ?? "Admin" }}
          </button>

          <button
            v-if="isAdmin && isAdminView"
            type="button"
            :class="linkClass"
            @click="$emit('open-catalog')"
          >
            {{ catalogLabel ?? "Catalog" }}
          </button>

          <button
            type="button"
            :class="linkClass"
            :title="sessionEmail ?? undefined"
            @click="$emit('sign-out')"
          >
            {{ signOutLabel ?? "Sign out" }}
          </button>
        </template>
        <button
          v-else-if="!authBusy"
          type="button"
          :class="linkClass"
          @click="$emit('connect-google')"
        >
          {{ signInLabel ?? "Sign in" }}
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";

import iconUrl from "@/assets/brand/propulso-icon.svg";
import wordmarkUrl from "@/assets/brand/propulso-wordmark.svg";
import { localizeHref } from "@/paraglide/runtime";

const props = defineProps<{
  sessionEmail?: string | null;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  view?: string;
  authBusy?: boolean;
  connectGoogleLabel?: string;
  connectingLabel?: string;
  signInLabel?: string;
  signOutLabel?: string;
  adminLabel?: string;
  catalogLabel?: string;
  ordersLabel?: string;
  /** Affiche le crédit restant. */
  showCredit?: boolean;
  creditLabel?: string;
  creditRemainingLabel?: string;
}>();

defineEmits<{
  "connect-google": [];
  "sign-out": [];
  "open-admin": [];
  "open-orders": [];
  "open-catalog": [];
  "open-home": [];
}>();

const linkClass =
  "text-foreground hover:bg-encre/8 focus-visible:ring-ring/40 inline-flex h-10 cursor-pointer items-center rounded-md px-3 outline-none transition-colors focus-visible:ring-[3px]";

const localizedHome = localizeHref("/");

const isAdminView = computed(() => Boolean(props.view?.startsWith("admin")));
</script>
