<template>
  <!-- Fond blanc: les photos de produits sont détourées sur blanc. -->
  <div :class="cn('relative overflow-hidden bg-white', className)">
    <img
      v-if="currentImage"
      :src="currentImage"
      :alt="alt"
      :class="
        cn(
          'h-full w-full object-contain p-3',
          zoomable ? 'cursor-zoom-in' : '',
        )
      "
      loading="lazy"
      @error="markFailed"
      @click="openZoom"
    />
    <!-- Sans photo: une surface de marque plutôt qu'un cadre vide. -->
    <div v-else class="matiere h-full w-full" aria-hidden="true" />

    <template v-if="imageCount > 1">
      <button
        type="button"
        :class="arrowClass"
        class="left-2"
        aria-label="Image précédente"
        @click.stop.prevent="goPrevious"
      >
        <ChevronLeft class="size-4" />
      </button>
      <button
        type="button"
        :class="arrowClass"
        class="right-2"
        aria-label="Image suivante"
        @click.stop.prevent="goNext"
      >
        <ChevronRight class="size-4" />
      </button>
      <div
        class="bg-card/90 absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full px-2 py-1"
        aria-hidden="true"
      >
        <span
          v-for="(src, dotIndex) in validImages"
          :key="src"
          :class="
            cn(
              'size-1.5 rounded-full',
              dotIndex === activeIndex ? 'bg-foreground' : 'bg-input',
            )
          "
        />
      </div>
    </template>
  </div>

  <Teleport to="body">
    <div
      v-if="zoomOpen && currentImage"
      class="bg-encre/90 fixed inset-0 z-[120] flex items-center justify-center p-4"
      @click.self="closeZoom"
    >
      <img
        :src="currentImage"
        :alt="alt"
        class="bg-card max-h-[92vh] max-w-[92vw] rounded-lg object-contain"
        loading="lazy"
      />
      <Button
        variant="secondary"
        size="icon"
        class="absolute top-4 right-4 rounded-full"
        aria-label="Fermer l'agrandissement"
        @click="closeZoom"
      >
        <X class="size-4" />
      </Button>
      <template v-if="imageCount > 1">
        <Button
          variant="secondary"
          size="icon"
          class="absolute top-1/2 left-4 -translate-y-1/2 rounded-full"
          aria-label="Image précédente"
          @click.stop.prevent="goPrevious"
        >
          <ChevronLeft class="size-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          class="absolute top-1/2 right-4 -translate-y-1/2 rounded-full"
          aria-label="Image suivante"
          @click.stop.prevent="goNext"
        >
          <ChevronRight class="size-4" />
        </Button>
      </template>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight, X } from "lucide-vue-next";
import { computed, ref, watch } from "vue";

import Button from "@/components/ui/Button.vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  id: string;
  alt: string;
  imageGallery?: string[];
  className?: string;
  zoomable?: boolean;
}>();

const arrowClass =
  "bg-card/90 text-foreground hover:bg-card focus-visible:ring-ring/40 absolute top-1/2 inline-flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full shadow-xs outline-none transition-colors focus-visible:ring-[3px]";

const index = ref(0);
const failed = ref<Record<string, boolean>>({});
const zoomOpen = ref(false);

const validImages = computed(() =>
  (props.imageGallery ?? []).filter((src) => !failed.value[src]),
);
const imageCount = computed(() => validImages.value.length);
const currentImage = computed(() => {
  if (imageCount.value === 0) {
    return null;
  }

  return validImages.value[index.value % imageCount.value];
});
const activeIndex = computed(() =>
  imageCount.value > 0 ? index.value % imageCount.value : 0,
);

const markFailed = () => {
  const image = currentImage.value;
  if (!image) {
    return;
  }

  failed.value = {
    ...failed.value,
    [image]: true,
  };
};

const goPrevious = () => {
  if (imageCount.value <= 1) {
    return;
  }

  index.value = (index.value - 1 + imageCount.value) % imageCount.value;
};

const goNext = () => {
  if (imageCount.value <= 1) {
    return;
  }

  index.value = (index.value + 1) % imageCount.value;
};

const openZoom = () => {
  if (!props.zoomable || !currentImage.value) {
    return;
  }
  zoomOpen.value = true;
};

const closeZoom = () => {
  zoomOpen.value = false;
};

watch(
  () => (props.imageGallery ?? []).join("|"),
  () => {
    index.value = 0;
  },
);
</script>
