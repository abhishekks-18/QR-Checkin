import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Configure external packages for server components
  
  // Ensure we're not using both transpilePackages and serverComponentsExternalPackages
  // as they can conflict with each other
};

export default nextConfig;
