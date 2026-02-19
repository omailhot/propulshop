import { createApp } from "vue";

import App from "@/App.vue";
import "./styles.css";
import "vue-sonner/style.css";

const app = createApp(App);

document.documentElement.setAttribute("lang", "fr");

app.mount("#app");
