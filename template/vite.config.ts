import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      // This allows using the cleaner '@sahara/spa' import path in the app
      "@sahara/spa": "@martialboissonneault/sahara-spa",
    },
  },
});
