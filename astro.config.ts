// @ts-check
import { defineConfig } from "astro/config";

import solidJs from "@astrojs/solid-js";

// https://astro.build/config
export default defineConfig({
  i18n: {
    locales: ["en", "es", "fr-FR", "zh-HANS"],
    defaultLocale: "en",
  },

  prefetch: true,
  integrations: [solidJs()],
});