import { createApp } from "vue";

import App from "@/App.vue";

// Polices de la charte, servies par l'application elle-même (aucun appel à
// un tiers): Newsreader pour la voix, Inter pour la clarté.
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/newsreader/opsz.css";
import "@fontsource-variable/newsreader/opsz-italic.css";

import "./styles.css";
import "vue-sonner/style.css";

const app = createApp(App);

document.documentElement.setAttribute("lang", "fr");

app.mount("#app");
