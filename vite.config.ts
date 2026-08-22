import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
  },
  preview: {
    host: true,
    allowedHosts: true,
  },
  build: {
    target: "es2022",
  },
});
