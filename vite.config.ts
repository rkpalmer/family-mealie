import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2021",
    minify: "esbuild",
    sourcemap: true,
    lib: {
      entry: "src/family-mealie-planner-card.ts",
      formats: ["es"],
      fileName: () => "family-mealie-planner-card.js",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});
