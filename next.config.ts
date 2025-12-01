import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow ngrok and local network origins for dev tunneling
  allowedDevOrigins: [
    "localhost:3000",
    "127.0.0.1:3000",
    "192.168.43.236:3000", // Your local network IP
    "09499e49d511.ngrok-free.app", // Your ngrok domain
  ],

  // External packages that should not be bundled
  serverExternalPackages: ["pg"],
};

export default nextConfig;
