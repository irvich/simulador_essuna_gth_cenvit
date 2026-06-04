import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Build de demo autónomo: base relativa + todo en un bundle para portabilidad
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "demo-dist",
    rollupOptions: {
      input: "demo.html",
      output: { inlineDynamicImports: true },
    },
  },
});
