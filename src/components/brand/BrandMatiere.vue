<template>
  <!--
    Surface de marque: la terre (dégradé grainé), les ondes (un signal qui se
    propage depuis un lieu) et un seul moment de verre. Le verre ne floute
    pas: sous la loupe, le grain disparaît et le tracé devient net.
    Purement décoratif: aucun texte, aucun chiffre ne se pose ici.
  -->
  <svg
    class="block size-full"
    viewBox="0 0 400 400"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient :id="`${uid}-terre`" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stop-color="#7A1C1C" />
        <stop offset="0.52" stop-color="#C23E1D" />
        <stop offset="1" stop-color="#F0752B" />
      </linearGradient>
      <radialGradient :id="`${uid}-lueur`" cx="0.12" cy="0.1" r="0.9">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.2" />
        <stop offset="0.6" stop-color="#FFFFFF" stop-opacity="0" />
      </radialGradient>
      <filter :id="`${uid}-grain`" x="0" y="0" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="3"
          seed="7"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <clipPath :id="`${uid}-loupe`">
        <circle :cx="lens.x" :cy="lens.y" :r="lens.r" />
      </clipPath>
      <g :id="`${uid}-ondes`" fill="none">
        <circle
          v-for="radius in waves"
          :key="radius"
          :cx="origin.x"
          :cy="origin.y"
          :r="radius"
        />
      </g>
    </defs>

    <!-- La terre: le monde réel, jamais parfaitement lisible tel quel. -->
    <rect width="400" height="400" :fill="`url(#${uid}-terre)`" />
    <use
      :href="`#${uid}-ondes`"
      stroke="#F4EEE6"
      stroke-opacity="0.3"
      stroke-width="1.25"
    />
    <rect
      width="400"
      height="400"
      :filter="`url(#${uid}-grain)`"
      opacity="0.42"
      style="mix-blend-mode: overlay"
    />
    <rect width="400" height="400" :fill="`url(#${uid}-lueur)`" />

    <!-- Le verre: la couche qui traverse et met au point. -->
    <g :clip-path="`url(#${uid}-loupe)`">
      <rect width="400" height="400" :fill="`url(#${uid}-terre)`" />
      <rect width="400" height="400" fill="#FFFFFF" opacity="0.1" />
      <use
        :href="`#${uid}-ondes`"
        stroke="#FFFFFF"
        stroke-opacity="0.95"
        stroke-width="1.5"
      />
      <circle :cx="origin.x" :cy="origin.y" r="5" fill="#FFFFFF" />
    </g>
    <circle
      :cx="lens.x"
      :cy="lens.y"
      :r="lens.r"
      fill="none"
      stroke="#F4EEE6"
      stroke-opacity="0.85"
      stroke-width="1.5"
    />
    <circle
      :cx="lens.x"
      :cy="lens.y"
      :r="lens.r - 4"
      fill="none"
      stroke="#FFFFFF"
      stroke-opacity="0.22"
      stroke-width="1"
    />
  </svg>
</template>

<script setup lang="ts">
import { useId } from "vue";

const uid = `matiere-${useId()}`;

const origin = { x: 132, y: 262 };
const lens = { x: 170, y: 224, r: 104 };
const waves = [28, 62, 100, 142, 188, 238, 292, 350];
</script>
