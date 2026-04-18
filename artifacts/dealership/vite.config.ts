import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const isReplit = process.env.REPL_ID !== undefined;

// PORT is only required in dev mode (not during production build)
const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 3000;

// BASE_PATH is Replit-specific; outside Replit default to "/"
const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    // Replit-only dev plugins — only loaded inside Replit workspace
    ...(isReplit && process.env.NODE_ENV !== "production"
      ? [
          (await import("@replit/vite-plugin-runtime-error-modal").catch(() => null))?.default?.() ?? null,
          (await import("@replit/vite-plugin-cartographer").catch(() => null))?.cartographer?.({
            root: path.resolve(import.meta.dirname, ".."),
          }) ?? null,
          (await import("@replit/vite-plugin-dev-banner").catch(() => null))?.devBanner?.() ?? null,
        ].filter(Boolean)
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
