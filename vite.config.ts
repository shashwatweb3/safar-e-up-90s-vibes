// The shared Vite preset already includes the following — do NOT add them
// manually or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss,
//     tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     VITE_* env injection, @ path alias, React/TanStack dedupe, error logger
//     plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // TanStack Start uses Nitro for its SSR server. Pin the deployment adapter so
  // local builds and Vercel builds produce Vercel's Build Output API format
  // instead of the shared preset's Cloudflare fallback.
  nitro: { preset: "vercel" },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
