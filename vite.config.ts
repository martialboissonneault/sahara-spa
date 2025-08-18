import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [dts({ insertTypesEntry: true })],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      name: "SaharaSpa",
      formats: ["es", "umd"],
      fileName: (format) => `sahara-spa.${format}.js`,
    },
    minify: false,
  },
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, "src/lib"),
      $routes: path.resolve(__dirname, "src/routes"),
    },
  },
});
