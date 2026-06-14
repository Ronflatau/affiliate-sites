/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SITE_ID: process.env.SITE_ID,
    NEXT_PUBLIC_SITE_ID: process.env.SITE_ID,
  },
  output: 'standalone',
};

export default nextConfig;
