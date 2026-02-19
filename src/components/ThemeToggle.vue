<template>
  <Button
    variant="outline"
    size="icon"
    :aria-label="label"
    :title="label"
    @click="toggleTheme"
  >
    <Moon v-if="theme === 'dark'" class="size-4" />
    <Sun v-else class="size-4" />
  </Button>
</template>

<script setup lang="ts">
import Button from "@/components/ui/Button.vue";
import { THEME_STORAGE_KEY } from "@/config/theme";
import { m } from "@/paraglide/messages";
import { Moon, Sun } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";

type Theme = "light" | "dark";

const theme = ref<Theme>("light");

const prefersDark = () =>
  window.matchMedia?.("(prefers-color-scheme: dark)").matches;

onMounted(() => {
  const persisted = window.localStorage.getItem(THEME_STORAGE_KEY);
  const resolvedTheme =
    persisted === "light" || persisted === "dark"
      ? persisted
      : prefersDark()
        ? "dark"
        : "light";

  theme.value = resolvedTheme;
  applyTheme(theme.value);
});

const applyTheme = (nextTheme: Theme) => {
  document.documentElement.classList.toggle("dark", nextTheme === "dark");
  document.documentElement.style.colorScheme =
    nextTheme === "dark" ? "dark" : "light";
  window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
};

const toggleTheme = () => {
  theme.value = theme.value === "dark" ? "light" : "dark";
  applyTheme(theme.value);
};

const label = computed(() =>
  theme.value === "dark" ? m.theme_enable_light() : m.theme_enable_dark(),
);
</script>
