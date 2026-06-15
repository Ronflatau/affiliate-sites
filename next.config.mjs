/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SITE_ID: process.env.SITE_ID,
    NEXT_PUBLIC_SITE_ID: process.env.SITE_ID,
  },
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'impact-site-verification',
            value: '357611c3-131f-4655-85c5-cad13fb3f995',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
