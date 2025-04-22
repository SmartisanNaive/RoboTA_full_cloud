/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    return config;
  },
  serverExternalPackages: ["shiki"],
}

export default nextConfig;

