import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Pleed-FAQ",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
