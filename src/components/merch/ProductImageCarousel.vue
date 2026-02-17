<template>
  <div :class="cn('relative overflow-hidden rounded-xl', className)">
    <img
      v-if="currentImage"
      :src="currentImage"
      :alt="alt"
      class="h-full w-full bg-muted/20 object-contain p-2"
      loading="lazy"
      @error="markFailed"
    />
    <div v-else :class="cn('h-full w-full bg-gradient-to-br', gradientClass)" />

    <template v-if="imageCount > 1">
      <Button
        variant="secondary"
        size="icon"
        class="absolute top-1/2 left-2 h-7 w-7 -translate-y-1/2 rounded-full bg-background/85"
        :aria-label="`${id}-previous-image`"
        @click.stop.prevent="goPrevious"
      >
        <ChevronLeft class="size-4" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        class="absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2 rounded-full bg-background/85"
        :aria-label="`${id}-next-image`"
        @click.stop.prevent="goNext"
      >
        <ChevronRight class="size-4" />
      </Button>
      <div class="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-background/80 px-2 py-1">
        <span
          v-for="(src, dotIndex) in validImages"
          :key="src"
          :class="cn('h-1.5 w-1.5 rounded-full', dotIndex === activeIndex ? 'bg-foreground' : 'bg-muted-foreground/50')"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { computed, ref } from 'vue'

import Button from '@/components/ui/Button.vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  id: string
  alt: string
  imageGallery?: string[]
  gradientClass: string
  className?: string
}>()

const index = ref(0)
const failed = ref<Record<string, boolean>>({})

const validImages = computed(() => (props.imageGallery ?? []).filter((src) => !failed.value[src]))
const imageCount = computed(() => validImages.value.length)
const currentImage = computed(() => {
  if (imageCount.value === 0) {
    return null
  }

  return validImages.value[index.value % imageCount.value]
})
const activeIndex = computed(() => (imageCount.value > 0 ? index.value % imageCount.value : 0))

const markFailed = () => {
  const image = currentImage.value
  if (!image) {
    return
  }

  failed.value = {
    ...failed.value,
    [image]: true,
  }
}

const goPrevious = () => {
  if (imageCount.value <= 1) {
    return
  }

  index.value = (index.value - 1 + imageCount.value) % imageCount.value
}

const goNext = () => {
  if (imageCount.value <= 1) {
    return
  }

  index.value = (index.value + 1) % imageCount.value
}
</script>