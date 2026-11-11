<template>
  <UiDrawer :open="open" :direction="direction" @update:open="onUpdateOpen">
    <!-- Panneau latéral: pleine hauteur, le contenu gère sa propre mise en page. -->
    <UiDrawerContent
      v-if="direction === 'right'"
      :aria-label="title"
      class="bg-background data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:shadow-2xl data-[vaul-drawer-direction=right]:sm:max-w-md"
    >
      <div class="flex h-full min-h-0 flex-col">
        <slot />
      </div>
    </UiDrawerContent>
    <!-- Feuille du bas: la fiche produit. -->
    <UiDrawerContent
      v-else
      :aria-label="title"
      class="bg-background data-[vaul-drawer-direction=bottom]:max-h-[86vh] data-[vaul-drawer-direction=bottom]:rounded-t-2xl"
    >
      <div class="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 sm:pb-10">
        <slot />
      </div>
    </UiDrawerContent>
  </UiDrawer>
</template>

<script setup lang="ts">
import {
  Drawer as UiDrawer,
  DrawerContent as UiDrawerContent,
} from "@/components/ui/drawer";

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    direction?: "bottom" | "right";
  }>(),
  { direction: "bottom" },
);

const emit = defineEmits<{
  close: [];
}>();

const onUpdateOpen = (nextOpen: boolean) => {
  if (!nextOpen && props.open) {
    emit("close");
  }
};
</script>
