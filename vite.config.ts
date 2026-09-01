import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  publicDir: false,
  build: {
    outDir: "dist-web",
    emptyOutDir: true,
    target: "es2022"
  },
  server: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true
  },
  preview: {
    host: "127.0.0.1",
    port: 4174,
    strictPort: true
  }
});
