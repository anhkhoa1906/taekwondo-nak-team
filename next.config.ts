import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",

  // Tắt PWA khi chạy development.
  // Production trên Vercel vẫn bật PWA.
  disable: process.env.NODE_ENV === "development",

  register: true,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
