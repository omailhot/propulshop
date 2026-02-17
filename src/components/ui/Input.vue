<template>
  <input
    :value="modelValue"
    class="flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
    v-bind="$attrs"
    @input="onInput"
  />
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>