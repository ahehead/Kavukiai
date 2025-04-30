import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@main": path.resolve(__dirname, "./src/main"),
      "@preload": path.resolve(__dirname, "./src/preload"),
      "@renderer": path.resolve(__dirname, "./src/renderer"),
      "@shared": path.resolve(__dirname, "./src/shared"),
    },
  },
  test: {
    globals: true, // With globals enabled, you don't need to import describe, it, vi, etc.
  },
});
