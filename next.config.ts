import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["http://0.0.0.0:3000"], // or your dev client IP + port
};

export default nextConfig;
