import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Discord avatars and server icons (cdn.discordapp.com/avatars|icons/…?size=…).
    // Query strings are allowed (no `search` restriction) for the size param.
    remotePatterns: [{ protocol: "https", hostname: "cdn.discordapp.com", pathname: "/**" }],
  },
};

export default nextConfig;
