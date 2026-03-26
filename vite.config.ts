import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const devPort = Number(process.env.VITE_PORT || 5173);
const backendPort = Number(process.env.BACKEND_PORT || process.env.PORT || 3000);

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: devPort,
    strictPort: true,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/wisp": {
        target: `ws://localhost:${backendPort}`,
        changeOrigin: true,
        ws: true,
      },
      "/api/alt-wisp-1": {
        target: `ws://localhost:${backendPort}`,
        changeOrigin: true,
        ws: true,
      },
      "/api/alt-wisp-2": {
        target: `ws://localhost:${backendPort}`,
        changeOrigin: true,
        ws: true,
      },
      "/api/alt-wisp-3": {
        target: `ws://localhost:${backendPort}`,
        changeOrigin: true,
        ws: true,
      },
      "/api": {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
      },
      "/bare": {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
        ws: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));