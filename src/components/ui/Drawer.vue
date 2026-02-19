<template>
  <UiDrawer :open="open" @update:open="onUpdateOpen">
    <UiDrawerContent
      :aria-label="title"
      class="bg-background data-[vaul-drawer-direction=bottom]:max-h-[86vh] data-[vaul-drawer-direction=bottom]:rounded-t-2xl"
    >
      <div class="mx-auto w-full max-w-[96rem] px-4 pb-8 sm:px-6 sm:pb-10">
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

const props = defineProps<{
  open: boolean;
  title: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const onUpdateOpen = (nextOpen: boolean) => {
  if (!nextOpen && props.open) {
    emit("close");
  }
};
</script>
