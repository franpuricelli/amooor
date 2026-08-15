/** @type {import('next').NextConfig} */

// EN · Set NEXT_PUBLIC_BASE_PATH=/template (and EXPORT=1) to build a static
//      bundle mounted under a sub-path — e.g. served at /template inside another
//      app via an <iframe>. Left unset, the template builds/runs normally at /.
// ES · Poné NEXT_PUBLIC_BASE_PATH=/template (y EXPORT=1) para buildear un bundle
//      estático montado bajo un sub-path — ej. servido en /template dentro de
//      otra app vía <iframe>. Sin setear, el template buildea/corre normal en /.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  // Photos are served as static assets, so skip Next's on-demand optimizer.
  images: { unoptimized: true },
  reactStrictMode: true,
  ...(process.env.EXPORT ? { output: "export" } : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
