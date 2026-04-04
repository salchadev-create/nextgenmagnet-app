import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  /* config options here */
};

export default nextConfig;

// Note: We're using a custom service worker (public/sw.js) instead of next-pwa
// to have better control over caching strategies and avoid MIME type issues.
// See PWAInstaller.tsx for service worker registration.
