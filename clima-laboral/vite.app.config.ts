// Build de la aplicación de producción (main.tsx → App.tsx con Supabase).
// Usar con: npm run build:app
// Se despliega por separado cuando se tienen las credenciales de Supabase.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist-app",
    rollupOptions: {
      input: "app.html",
    },
  },
  base: process.env.GITHUB_PAGES === "1"
    ? "/simulador_essuna_gth_cenvit/clima-laboral/"
    : "/",
});
