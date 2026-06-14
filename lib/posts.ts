import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  siteId: string;
  tags: string[];
}

export interface Post extends PostMeta {
  content: string;
}

function getSiteId(): string {
  return process.env.SITE_ID || process.env.NEXT_PUBLIC_SITE_ID || 'ai-tools';
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const siteId = getSiteId();
  const files = fs.readdirSync(POSTS_DIR).filter(
    f => f.endsWith('.mdx') && f.startsWith(`${siteId}-`) && !f.startsWith('.')
  );

  return files
    .map(filename => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf8');
      const { data } = matter(raw);
      return {
        slug: filename.replace(`${siteId}-`, '').replace('.mdx', ''),
        title: data.title || '',
        description: data.description || '',
        date: data.date || '',
        siteId: data.siteId || siteId,
        tags: data.tags || [],
      } as PostMeta;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPost(slug: string): Post | null {
  const siteId = getSiteId();
  const filePath = path.join(POSTS_DIR, `${siteId}-${slug}.mdx`);

  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title || '',
    description: data.description || '',
    date: data.date || '',
    siteId: data.siteId || siteId,
    tags: data.tags || [],
    content,
  };
}

export interface SiteConfig {
  siteId: string;
  siteName: string;
  tagline: string;
  niche: string;
  hero: { headline: string; subheadline: string; cta: string; socialProof: string };
  color: { accent: string; accentDark: string; accentLight: string; accentRgb: string };
  trustBar: string[];
  affiliateProducts: string[];
  keywords: string[];
}

export function getSiteConfig(): SiteConfig | null {
  const siteId = getSiteId();
  const configPath = path.join(process.cwd(), 'configs', `${siteId}.config.json`);
  if (!fs.existsSync(configPath)) return null;
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}
