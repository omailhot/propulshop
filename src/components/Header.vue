<template>
  <!--
    Fond plein, pas de verre dépoli: dans la charte, le verre met au point,
    il ne floute jamais.
  -->
  <header class="bg-background sticky top-0 z-40 border-b">
    <div
      class="mx-auto flex h-16 max-w-[96rem] items-center justify-between gap-3 px-4 sm:px-6"
    >
      <a
        :href="localizedHome"
        class="focus-visible:ring-ring/40 flex min-w-0 items-center gap-5 rounded-md outline-none focus-visible:ring-[3px]"
        @click.prevent="$emit('open-home')"
      >
        <!--
          Taille minimale du wordmark: 1,5 po (144 px). En dessous, l'icône
          prend le relais. La zone de protection vaut la largeur du « o ».
        -->
        <img
          :src="wordmarkUrl"
          alt="Propulso"
          class="hidden h-[30px] w-[144px] shrink-0 sm:block"
          width="144"
          height="30"
        />
        <img
          :src="iconUrl"
          alt="Propulso"
          class="h-8 w-auto shrink-0 sm:hidden"
          width="29"
          height="32"
        />
        <span class="border-border min-w-0 border-l pl-5">
          <span class="block truncate text-[15px] leading-tight font-semibold">
            {{ title ?? m.header_name() }}
          </span>
          <span
            v-if="subtitle"
            class="text-muted-foreground block truncate text-xs leading-tight"
          >
            {{ subtitle }}
          </span>
        </span>
      </a>

      <div class="flex shrink-0 items-center gap-2">
        <template v-if="isAuthenticated">
          <span class="text-muted-foreground hidden text-xs md:inline">{{
            sessionEmail
          }}</span>
          <Button
            v-if="isAdmin && view !== 'admin'"
            size="sm"
            variant="outline"
            @click="$emit('open-admin')"
          >
            {{ adminLabel ?? "Admin" }}
          </Button>
          <Button
            v-if="isAdmin && view === 'admin'"
            size="sm"
            variant="outline"
            @click="$emit('open-catalog')"
          >
            {{ catalogLabel ?? "Catalog" }}
          </Button>
          <Button size="sm" variant="ghost" @click="$emit('sign-out')">
            {{ signOutLabel ?? "Sign out" }}
          </Button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import iconUrl from "@/assets/brand/propulso-icon.svg";
import wordmarkUrl from "@/assets/brand/propulso-wordmark.svg";
import Button from "@/components/ui/Button.vue";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

defineProps<{
  title?: string;
  subtitle?: string;
  sessionEmail?: string | null;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  view?: "catalog" | "confirmation" | "placed" | "admin" | "admin-order";
  authBusy?: boolean;
  connectGoogleLabel?: string;
  connectingLabel?: string;
  signOutLabel?: string;
  adminLabel?: string;
  catalogLabel?: string;
}>();

defineEmits<{
  "connect-google": [];
  "sign-out": [];
  "open-admin": [];
  "open-catalog": [];
  "open-home": [];
}>();

const localizedHome = localizeHref("/");
</script>
