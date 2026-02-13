import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, "extension/src/background/service-worker.ts"),
        content: resolve(__dirname, "extension/src/content/content-script.ts"),
        popup: resolve(__dirname, "extension/src/ui/popup.html"),
        options: resolve(__dirname, "extension/src/ui/options.html")
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  }
});
