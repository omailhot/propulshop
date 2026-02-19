<template>
  <div
    class="relative inline-block"
    @mouseenter="open = true"
    @mouseleave="open = false"
  >
    <slot name="trigger" />
    <transition
      enter-active-class="transition duration-150"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="open"
        class="bg-popover text-popover-foreground absolute z-50 mt-2 w-64 rounded-md border p-4 shadow-md"
      >
        <slot name="content" />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const open = ref(false);
</script>
