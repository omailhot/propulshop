<template>
  <TooltipProvider>
    <Tooltip :open="open" @update:open="(next) => (open = next)">
      <TooltipTrigger as-child>
        <button
          type="button"
          class="text-muted-foreground hover:text-foreground inline-flex items-center transition-colors"
          :aria-label="content"
          @click="open = !open"
        >
          <slot />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        :side-offset="8"
        class="bg-encre text-grege z-[90] max-w-80 rounded-md px-3 py-2 text-[13px] leading-relaxed font-normal shadow-lg"
      >
        {{ content }}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>

<script setup lang="ts">
import { ref } from "vue";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

defineProps<{
  content: string;
}>();

const open = ref(false);
</script>
