import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Build de demo autónomo como IIFE (script clásico, NO módulo ES).
// Esto permite abrir el HTML resultante directamente con doble clic (file://),
// donde los módulos ES están bloqueados por CORS.
export default defineConfig({
  plugins: [react()],
  define: { "process.env.NODE_ENV": '"production"' },
  build: {
    outDir: "demo-dist",
    lib: {
      entry: "src/demo.tsx",
      name: "ClimaDemo",
      formats: ["iife"],
      fileName: () => "demo.js",
    },
  },
});
