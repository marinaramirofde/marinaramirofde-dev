import { defineConfig } from "astro/config";

const site = process.env.SITE_URL || "https://marinaramirofde.dev";
const base = process.env.BASE_PATH || "/";

export default defineConfig({
  site,
  base,
  output: "static",
  build: {
    format: "directory"
  },
  vite: {
    build: {
      assetsInlineLimit: 0
    }
  }
});
