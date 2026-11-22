import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

/**
 * Iconos de la PWA. Se generan solos en cada build a partir de
 * `public/icon.svg` (la cabeza del elfo): favicon, apple-touch-icon y los PNG
 * del manifiesto. Si cambias el icono, cambia solo ese SVG.
 *
 * El dibujo va a sangre (fondo verde hasta el borde) y cabe en el círculo
 * central, así que va tal cual en todos: Android lo recorta en círculo e iOS
 * redondea las esquinas.
 */
export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: {
    ...minimal2023Preset,
    transparent: { ...minimal2023Preset.transparent, padding: 0 },
    maskable: { ...minimal2023Preset.maskable, padding: 0 },
    apple: { ...minimal2023Preset.apple, padding: 0 },
  },
  images: ["public/icon.svg"],
});
