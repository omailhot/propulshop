<template>
  <button
    type="button"
    :aria-checked="modelValue"
    role="checkbox"
    :class="cn('peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 inline-flex items-center justify-center', modelValue ? 'bg-primary text-primary-foreground border-primary' : '', $attrs.class as string)"
    v-bind="$attrs"
    @click="emit('update:modelValue', !modelValue)"
  >
    <CheckIcon v-if="modelValue" class="size-3.5" />
  </button>
</template>

<script setup lang="ts">
import { CheckIcon } from 'lucide-vue-next'

import { cn } from '@/lib/utils'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>