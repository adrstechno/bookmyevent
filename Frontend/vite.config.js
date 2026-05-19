import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import os from "os";

// Helper: find a usable local IPv4 address (first non-internal)
const getLocalIp = () => {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "localhost";
};

// Allow overriding via environment when needed (e.g. CI, containers, special networks)
const hmrHost = process.env.VITE_HMR_HOST || getLocalIp();
const hmrPort = process.env.VITE_HMR_PORT
  ? Number(process.env.VITE_HMR_PORT)
  : 5173;
const hmrProtocol = process.env.VITE_HMR_PROTOCOL || "ws";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // bind to all interfaces so dev server + HMR are reachable from other networks
    host: true,
    port: 5173,
    strictPort: false,
    open: false,
    cors: true,
    // HMR client should connect using the address the browser can reach.
    hmr: {
      protocol: hmrProtocol,
      host: hmrHost,
      port: hmrPort,
    },
    watch: {
      usePolling: false,
      interval: 100,
    },
  },
  preview: {
    port: 5173,
    // allow preview to be reachable on LAN too
    host: true,
    strictPort: false,
    open: false,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
