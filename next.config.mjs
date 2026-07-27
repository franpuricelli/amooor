/** @type {import('next').NextConfig} */
const nextConfig = {
  // Images are pre-optimized by tools/prepare-photos.sh and served as static
  // assets, so we skip Next's on-demand optimizer (keeps us off Vercel's
  // hobby-tier image quota).
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
