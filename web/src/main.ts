import { createApp } from "vue";
import { createVuetify } from "vuetify";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import App from "./App.vue";

const vuetify = createVuetify({
  theme: {
    defaultTheme: "christmas",
    themes: {
      christmas: {
        dark: false,
        colors: { primary: "#B71C1C", secondary: "#1B5E20", surface: "#FFFFFF", background: "#FAF7F2" },
      },
    },
  },
});

createApp(App).use(vuetify).mount("#app");
