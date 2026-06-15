import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteId = process.env.SITE_ID || '';

  // Map siteId → production URL
  const domains: Record<string, string> = {
    'ai-tools': 'https://affiliate-ai-tools-three.vercel.app',
    'web-hosting': 'https://affiliate-web-hosting.vercel.app',
    'finance': 'https://affiliate-finance-gamma.vercel.app',
    'saas-software': 'https://affiliate-saas-pi.vercel.app',
    'home-office': 'https://affiliate-home-office.vercel.app',
  };

  const baseUrl = domains[siteId] || `https://${siteId}.vercel.app`;

  const posts = getAllPosts();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  const postPages: MetadataRoute.Sitemap = posts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...postPages];
}
