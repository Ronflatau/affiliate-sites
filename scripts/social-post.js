/**
 * Social Auto-Posting Script
 * Reads newly generated articles and posts to Buffer (Twitter + LinkedIn + Pinterest)
 * Buffer then distributes to all connected social accounts automatically.
 *
 * Requires GitHub Secrets:
 *   BUFFER_ACCESS_TOKEN  — from buffer.com/account/team (free account works)
 *   BUFFER_PROFILE_IDS   — comma-separated IDs (run node scripts/buffer-profiles.js to get them)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const BUFFER_TOKEN = process.env.BUFFER_ACCESS_TOKEN;
const PROFILE_IDS = (process.env.BUFFER_PROFILE_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
const SITE_ID = process.env.SITE_ID;
const SITE_URL = process.env.SITE_URL; // e.g. https://affiliate-saas-pi.vercel.app

const SITE_URLS = {
  'ai-tools': 'https://affiliate-ai-tools-three.vercel.app',
  'web-hosting': 'https://affiliate-web-hosting.vercel.app',
  'finance': 'https://affiliate-finance-gamma.vercel.app',
  'saas-software': 'https://affiliate-saas-pi.vercel.app',
  'home-office': 'https://affiliate-home-office.vercel.app',
};

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Parse frontmatter from MDX file
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fm = {};
  for (const line of match[1].split('\n')) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) {
      fm[key.trim()] = rest.join(':').trim().replace(/^"|"$/g, '');
    }
  }
  return fm;
}

// Get articles created in the last 24 hours for this site
async function getNewArticles() {
  const postsDir = path.join(ROOT, 'content', 'posts');
  const files = await fs.readdir(postsDir);
  const siteFiles = files.filter(f => f.startsWith(`${SITE_ID}-`) && f.endsWith('.mdx'));

  const cutoff = Date.now() - 26 * 60 * 60 * 1000; // 26h ago (buffer for timing)
  const newArticles = [];

  for (const file of siteFiles) {
    const stat = await fs.stat(path.join(postsDir, file));
    if (stat.mtimeMs > cutoff) {
      const content = await fs.readFile(path.join(postsDir, file), 'utf8');
      const fm = parseFrontmatter(content);
      if (fm?.title) {
        const slug = file.replace(`${SITE_ID}-`, '').replace('.mdx', '');
        newArticles.push({ title: fm.title, description: fm.description, slug, tags: fm.tags || '' });
      }
    }
  }

  return newArticles;
}

// Generate platform-specific social captions using Claude
async function generateCaptions(article, baseUrl) {
  const articleUrl = `${baseUrl}/blog/${article.slug}`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: `You are a social media expert. Generate 3 social media posts for this article. Each post must feel human, conversational, and NOT like marketing spam.

Article title: "${article.title}"
Article description: "${article.description}"
Article URL: ${articleUrl}

Write exactly 3 posts in this JSON format (no other text):
{
  "twitter": "tweet text (max 240 chars, include URL, use 1-2 relevant emojis, no hashtag spam, sounds like a real person sharing something useful)",
  "linkedin": "linkedin post (150-200 words, professional but conversational, tell a mini story or share a key insight from the article, end with the URL, 2-3 hashtags max)",
  "pinterest": "pinterest description (80-120 words, descriptive, helpful, keywords naturally included, URL at end)"
}`
    }]
  });

  try {
    const text = message.content[0].text.trim();
    return JSON.parse(text);
  } catch {
    // Fallback if JSON parse fails
    return {
      twitter: `${article.title} — ${articleUrl}`,
      linkedin: `${article.title}\n\n${article.description}\n\n${articleUrl}`,
      pinterest: `${article.title}. ${article.description} ${articleUrl}`
    };
  }
}

// Post to Buffer API
async function postToBuffer(text, profileIds, scheduledAt = null) {
  if (!BUFFER_TOKEN || profileIds.length === 0) {
    console.log('  [DRY RUN] Would post to Buffer:', text.slice(0, 80) + '...');
    return { success: true, dry: true };
  }

  const body = new URLSearchParams({
    access_token: BUFFER_TOKEN,
    text: text,
    now: scheduledAt ? 'false' : 'true',
  });

  profileIds.forEach(id => body.append('profile_ids[]', id));

  if (scheduledAt) {
    body.set('scheduled_at', scheduledAt);
  }

  const res = await fetch('https://api.bufferapp.com/1/updates/create.json', {
    method: 'POST',
    body: body,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Buffer API error: ${JSON.stringify(data)}`);
  }
  return { success: true, data };
}

// Stagger post times throughout the day (human-like pattern)
function getScheduledTimes(count) {
  const times = [];
  // Post at: 9am, 12pm, 3pm, 6pm (human usage peak hours)
  const slots = [9, 12, 15, 18];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  for (let i = 0; i < count; i++) {
    const hour = slots[i % slots.length];
    const d = new Date(tomorrow);
    d.setHours(hour, Math.floor(Math.random() * 30), 0, 0); // random minutes = human-like
    times.push(Math.floor(d.getTime() / 1000));
  }
  return times;
}

async function main() {
  if (!SITE_ID) {
    console.error('SITE_ID required');
    process.exit(1);
  }

  const baseUrl = SITE_URL || SITE_URLS[SITE_ID] || '';
  console.log(`\n=== Social Auto-Poster ===`);
  console.log(`Site: ${SITE_ID} → ${baseUrl}`);
  console.log(`Buffer profiles: ${PROFILE_IDS.length > 0 ? PROFILE_IDS.join(', ') : 'NOT SET (dry run)'}`);

  const articles = await getNewArticles();
  if (articles.length === 0) {
    console.log('No new articles found in last 26 hours. Nothing to post.');
    return;
  }

  console.log(`Found ${articles.length} new article(s) to promote\n`);

  const times = getScheduledTimes(articles.length);

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`Processing: "${article.title}"`);

    try {
      const captions = await generateCaptions(article, baseUrl);

      // Post Twitter caption (most concise = most cross-platform compatible)
      await postToBuffer(captions.twitter, PROFILE_IDS, times[i]);
      console.log(`  ✓ Queued for Buffer at ${new Date(times[i] * 1000).toISOString()}`);
      console.log(`  Preview: ${captions.twitter.slice(0, 100)}...`);

      // Rate limit between API calls
      await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
    }
  }

  console.log('\n✓ Social posting complete');
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
