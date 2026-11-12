<template>
  <span
    class="inline-flex items-baseline text-[2.5rem] leading-none sm:text-[3rem]"
  >
    <img
      :src="wordmarkUrl"
      alt="Propulso"
      class="-mb-[0.2295em] h-[1em] w-auto"
      width="238"
      height="50"
    />

    <span class="text-braise font-serif text-[1.3em] font-medium italic">
      shop
    </span>
  </span>
</template>

<script setup lang="ts">
import wordmarkUrl from "@/assets/brand/propulso-wordmark.svg";
</script>
