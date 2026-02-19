<template>
  <UiHoverCard>
    <UiHoverCardTrigger as-child>
      <slot name="trigger" />
    </UiHoverCardTrigger>
    <UiHoverCardContent class="w-64">
      <slot name="content" />
    </UiHoverCardContent>
  </UiHoverCard>
</template>

<script setup lang="ts">
import {
  HoverCard as UiHoverCard,
  HoverCardContent as UiHoverCardContent,
  HoverCardTrigger as UiHoverCardTrigger,
} from "@/components/ui/hover-card";
</script>
