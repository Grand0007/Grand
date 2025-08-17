/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['your-storage-account.blob.core.windows.net'],
  },
  env: {
    AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING,
    AZURE_COSMOS_CONNECTION_STRING: process.env.AZURE_COSMOS_CONNECTION_STRING,
    AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
    AZURE_COMMUNICATION_CONNECTION_STRING: process.env.AZURE_COMMUNICATION_CONNECTION_STRING,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;