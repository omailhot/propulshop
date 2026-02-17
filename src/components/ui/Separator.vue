<template>
  <hr :class="separatorClass" v-bind="$attrs" />
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    orientation?: 'horizontal' | 'vertical'
  }>(),
  {
    orientation: 'horizontal',
  },
)

const attrs = useAttrs()

const separatorClass = computed(() =>
  cn(
    'bg-border shrink-0',
    props.orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
    (attrs.class as string) ?? '',
  ),
)
</script>
