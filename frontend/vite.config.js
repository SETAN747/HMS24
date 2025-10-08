import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  define: {
    global: "globalThis", // ✅ Fix simple-peer issue
  },
  resolve: {
    alias: {
      stream: "stream-browserify",
       buffer: "buffer",
      process: "process/browser",
    },
  },
});
