<template>
  <header class="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
      <a :href="localizedHome" class="group flex items-center gap-3">
        <div class="flex size-10 items-center justify-center rounded-xl border border-orange-300/60 bg-[linear-gradient(90deg,#ffa000_20%,#ff4b00,#ff0035)] text-primary-foreground shadow-sm transition group-hover:scale-105">
          <ShoppingBag class="size-4" />
        </div>
        <div>
          <p class="font-semibold tracking-tight">{{ title ?? m.header_name() }}</p>
          <p class="text-xs text-muted-foreground">{{ subtitle ?? m.header_subtitle() }}</p>
        </div>
      </a>

      <div class="flex items-center gap-2">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ShoppingBag } from 'lucide-vue-next'

import LocaleSwitcher from '@/components/LocaleSwitcher.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { m } from '@/paraglide/messages'
import { localizeHref } from '@/paraglide/runtime'

defineProps<{
  title?: string
  subtitle?: string
}>()

const localizedHome = localizeHref('/')
</script>