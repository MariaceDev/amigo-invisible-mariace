import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    vue(),
    // PWA: se instala en el móvil («Añadir a pantalla de inicio»). El service
    // worker solo existe en el build y se actualiza solo.
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      pwaAssets: { config: true, overrideManifestIcons: true },
      manifest: {
        name: "Amigo invisible",
        short_name: "Amigo invisible",
        description: "El amigo invisible de la familia: apúntate, pide tus deseos y descubre a quién le regalas.",
        lang: "es",
        start_url: "/",
        display: "standalone",
        background_color: "#F2E8CF",
        theme_color: "#F2E8CF",
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        navigateFallback: "/index.html",
      },
    }),
  ],
  server: { port: 5173 },
});
