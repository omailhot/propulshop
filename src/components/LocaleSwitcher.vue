<template>
  <div class="flex items-center gap-2">
    <div class="flex items-center gap-1 rounded-full border bg-card/80 p-1">
      <Button
        v-for="locale in locales"
        :key="locale"
        :aria-pressed="locale === currentLocale"
        size="sm"
        :variant="locale === currentLocale ? 'default' : 'ghost'"
        class="rounded-full px-3"
        @click="setLocale(locale)"
      >
        {{ locale.toUpperCase() }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getLocale, locales, setLocale } from '@/paraglide/runtime'

import Button from '@/components/ui/Button.vue'

const currentLocale = getLocale()
</script>