import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5196,
    strictPort: true,
    host: true,
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
