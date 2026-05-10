import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/Cuanto-es-lo-mio/",
  plugins: [react()],
  server: {
    port: 5173,
  },
});
