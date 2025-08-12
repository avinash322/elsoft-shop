import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import router from "./router";
import { createPinia } from "pinia";
import vuetify from "./plugins/vuetify";
import { VueQueryPlugin } from "@tanstack/vue-query";

const app = createApp(App);
app.use(router);
app.use(vuetify);
app.use(createPinia());
app.use(VueQueryPlugin);
app.mount("#app");
