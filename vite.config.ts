import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
  server: {
    // db.json is the local file database; writes to it must never trigger
    // a dev-server full reload (that would wipe in-progress interview state).
    watch: {
      ignored: ["**/db.json", "**/dist-server/**"],
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
