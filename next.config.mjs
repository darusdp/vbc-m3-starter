/** @type {import('next').NextConfig} */
const nextConfig = {
  // The API routes read data/seed-requests.csv from disk at runtime.
  // Make sure it is bundled with the server functions when deployed.
  outputFileTracingIncludes: {
    "/api/**/*": ["./data/**/*"],
  },
};

export default nextConfig;
