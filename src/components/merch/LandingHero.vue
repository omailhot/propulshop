<template>
  <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
    <div class="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <div class="animate-fade-up rounded-3xl border bg-card/85 p-8 shadow-lg">
        <Badge class="border-0 bg-primary text-primary-foreground">
          <Sparkles class="size-3.5" />
          {{ t.landingBadge }}
        </Badge>
        <h1 class="mt-4 text-4xl leading-tight font-semibold tracking-tight">{{ t.landingTitle }}</h1>
        <p class="mt-3 max-w-xl text-sm text-muted-foreground">{{ t.landingDescription }}</p>
        <Button class="mt-6" @click="$emit('open-login')">{{ t.landingCta }}</Button>
      </div>

      <div class="animate-fade-up-delay space-y-3 rounded-3xl border bg-card/85 p-8 shadow-md">
        <div v-for="item in [t.landingBullet1, t.landingBullet2, t.landingBullet3]" :key="item" class="flex items-start gap-3 rounded-xl border bg-background/50 p-3">
          <CheckCircle2 class="mt-0.5 size-4 text-primary" />
          <p class="text-sm">{{ item }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { CheckCircle2, Sparkles } from 'lucide-vue-next'

import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import type { MerchCopy } from '@/config/merch-copy'

defineProps<{
  t: MerchCopy
}>()

defineEmits<{
  'open-login': []
}>()
</script>
