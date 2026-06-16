/** @type {import('next').NextConfig} */
const siteId = process.env.SITE_ID || process.env.APP_SITE_ID;

const nextConfig = {
  env: {
    SITE_ID: siteId,
    NEXT_PUBLIC_SITE_ID: siteId,
  },
  output: 'standalone',
  outputFileTracingIncludes: {
    '/**': ['./configs/**', './content/**'],
  },
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
