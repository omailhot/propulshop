<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <button
          type="button"
          class="text-muted-foreground hover:text-foreground inline-flex items-center transition-colors"
          :aria-label="content"
        >
          <slot />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        :side-offset="8"
        class="max-w-80 rounded-md border px-3 py-2 text-xs leading-relaxed"
      >
        {{ content }}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>

<script setup lang="ts">
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

defineProps<{
  content: string;
}>();
</script>
