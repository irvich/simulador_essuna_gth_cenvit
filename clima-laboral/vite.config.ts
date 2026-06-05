import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // GitHub Pages: /simulador_essuna_gth_cenvit/clima-laboral/
  // Vercel / local dev: /
  base: process.env.GITHUB_PAGES === "1"
    ? "/simulador_essuna_gth_cenvit/clima-laboral/"
    : "/",
});
