<template>
  <header
    class="bg-background/90 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-40 border-b backdrop-blur"
  >
    <div
      class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6"
    >
      <a :href="localizedHome" class="group flex items-center gap-3">
        <img
          src="/favicon.ico"
          alt="Propulso logo"
          class="border-border/70 bg-background size-10 rounded-xl border object-contain p-1 shadow-sm transition group-hover:scale-105"
        />
        <div>
          <p class="font-semibold tracking-tight">
            {{ title ?? m.header_name() }}
          </p>
          <p class="text-muted-foreground text-xs">
            {{ subtitle ?? m.header_subtitle() }}
          </p>
        </div>
      </a>

      <div class="flex items-center gap-2">
        <template v-if="isAuthenticated">
          <span class="text-muted-foreground hidden text-xs sm:inline">{{
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
          <Button size="sm" variant="ghost" @click="$emit('sign-out')">{{
            signOutLabel ?? "Sign out"
          }}</Button>
        </template>
        <Button
          v-else
          size="sm"
          variant="outline"
          :disabled="authBusy"
          @click="$emit('connect-google')"
        >
          {{
            authBusy
              ? (connectingLabel ?? "Connexion...")
              : (connectGoogleLabel ?? "Connexion Google")
          }}
        </Button>
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import ThemeToggle from "@/components/ThemeToggle.vue";
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
}>();

const localizedHome = localizeHref("/");
</script>
