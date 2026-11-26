import type { NextConfig } from "next";

// Publicación estática (GitHub Pages): solo si GITHUB_PAGES=true. Pages sirve el proyecto bajo /<repo>.
const staticExport = process.env.GITHUB_PAGES === "true";
const repoName = process.env.PAGES_REPO ?? "";
const basePath = staticExport && repoName ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  ...(staticExport ? { output: "export" as const, trailingSlash: true, images: { unoptimized: true } } : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  /* config options here */
  // PPR no es compatible con `output: export`: en la publicación estática se desactivan.
  cacheComponents: !staticExport,
  partialPrefetching: !staticExport,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
