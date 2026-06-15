/**
 * Social Auto-Posting via Buffer GraphQL API
 * Posts new articles to Twitter, Instagram, and Pinterest automatically.
 *
 * GitHub Secrets required:
 *   BUFFER_ACCESS_TOKEN  — from publish.buffer.com/settings/api
 *   ANTHROPIC_API_KEY    — for caption generation
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const BUFFER_TOKEN = process.env.BUFFER_ACCESS_TOKEN;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const SITE_ID = process.env.SITE_ID;

const ORG_ID = '69b7c549b6b067ec3a4d0d0e';

// All 3 connected channels
const CHANNELS = [
  { id: '6a2fa75d38b5579345985735', service: 'twitter',   name: 'flatau_ron' },
  { id: '6a2fa7dc38b55793459858b4', service: 'instagram', name: 'ron_flatau' },
  { id: '6a2fac8b38b5579345986516', service: 'pinterest', name: 'ronflatau' },
];

const SITE_URLS = {
  'ai-tools':      'https://affiliate-ai-tools-three.vercel.app',
  'web-hosting':   'https://affiliate-web-hosting.vercel.app',
  'finance':       'https://affiliate-finance-gamma.vercel.app',
  'saas-software': 'https://affiliate-saas-pi.vercel.app',
  'home-office':   'https://affiliate-home-office.vercel.app',
};

const client = new Anthropic({ apiKey: ANTHROPIC_KEY });

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fm = {};
  for (const line of match[1].split('\n')) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) fm[key.trim()] = rest.join(':').trim().replace(/^"|"$/g, '');
  }
  return fm;
}

async function getNewArticles() {
  const postsDir = path.join(ROOT, 'content', 'posts');
  const files = await fs.readdir(postsDir);
  const siteFiles = files.filter(f => f.startsWith(`${SITE_ID}-`) && f.endsWith('.mdx'));
  const cutoff = Date.now() - 26 * 60 * 60 * 1000;
  const articles = [];

  for (const file of siteFiles) {
    const stat = await fs.stat(path.join(postsDir, file));
    if (stat.mtimeMs > cutoff) {
      const content = await fs.readFile(path.join(postsDir, file), 'utf8');
      const fm = parseFrontmatter(content);
      if (fm?.title) {
        const slug = file.replace(`${SITE_ID}-`, '').replace('.mdx', '');
        articles.push({ title: fm.title, description: fm.description || '', slug });
      }
    }
  }
  return articles;
}

async function generateCaptions(article, url) {
  const articleUrl = `${url}/blog/${article.slug}`;
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `Write 3 social media posts for this article. Sound human, not like marketing spam.

Title: "${article.title}"
Description: "${article.description}"
URL: ${articleUrl}

Return ONLY valid JSON, no other text:
{
  "twitter": "tweet under 240 chars, include URL, 1-2 emojis, conversational tone",
  "instagram": "instagram caption 100-150 words, storytelling style, URL in bio note, 3-5 hashtags",
  "pinterest": "pinterest description 80-100 words, helpful and descriptive, keywords naturally, URL at end"
}`
    }]
  });

  try {
    return JSON.parse(message.content[0].text.trim());
  } catch {
    const fallback = `${article.title} — ${articleUrl}`;
    return { twitter: fallback, instagram: fallback, pinterest: fallback };
  }
}

async function bufferGraphQL(query, variables = {}) {
  const res = await fetch('https://api.buffer.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BUFFER_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  const data = await res.json();
  if (data.errors) throw new Error(`Buffer GraphQL error: ${JSON.stringify(data.errors)}`);
  return data.data;
}

// Schedule a post via Buffer GraphQL
async function schedulePost(channelId, text, dueAt) {
  if (!BUFFER_TOKEN) {
    console.log(`  [DRY RUN] Would post to channel ${channelId}: ${text.slice(0, 60)}...`);
    return null;
  }

  const mutation = `
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess { post { id status dueAt } }
        ... on InvalidInputError { message }
        ... on UnauthorizedError { message }
        ... on LimitReachedError { message }
        ... on UnexpectedError   { message }
      }
    }
  `;

  const data = await bufferGraphQL(mutation, {
    input: {
      channelId,
      text,
      schedulingType: 'automatic',
      mode: dueAt ? 'customScheduled' : 'addToQueue',
      ...(dueAt ? { dueAt } : {}),
      assets: [],
    }
  });

  const result = data.createPost;
  if (result?.message) throw new Error(result.message);
  return result?.post || null;
}

// Human-like posting times: spread across the next day at peak hours
function getScheduleTimes(count) {
  const slots = [9, 12, 15, 18, 20]; // peak engagement hours
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setSeconds(0, 0);

  return Array.from({ length: count }, (_, i) => {
    const d = new Date(tomorrow);
    d.setHours(slots[i % slots.length], Math.floor(Math.random() * 45), 0, 0);
    return d.toISOString();
  });
}

const CAPTION_KEY = { twitter: 'twitter', instagram: 'instagram', pinterest: 'pinterest', facebook: 'twitter' };

async function main() {
  if (!SITE_ID) { console.error('SITE_ID required'); process.exit(1); }

  const baseUrl = SITE_URLS[SITE_ID] || '';
  console.log(`\n=== Social Auto-Poster (Buffer GraphQL) ===`);
  console.log(`Site: ${SITE_ID}`);
  console.log(`Channels: ${CHANNELS.map(c => c.service).join(', ')}`);

  const articles = await getNewArticles();
  if (!articles.length) { console.log('No new articles in last 26h.'); return; }

  console.log(`Found ${articles.length} new article(s)\n`);
  const times = getScheduleTimes(articles.length);

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`📝 "${article.title}"`);

    try {
      const captions = await generateCaptions(article, baseUrl);

      for (const channel of CHANNELS) {
        const text = captions[CAPTION_KEY[channel.service]] || captions.twitter;
        try {
          const post = await schedulePost(channel.id, text, times[i]);
          console.log(`  ✓ ${channel.service} (@${channel.name}) scheduled at ${times[i]}`);
          if (post?.id) console.log(`    → Buffer post ID: ${post.id}`);
        } catch (err) {
          console.error(`  ✗ ${channel.service}: ${err.message}`);
        }
        await new Promise(r => setTimeout(r, 800));
      }
    } catch (err) {
      console.error(`  ✗ Caption generation failed: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n✓ Social posting complete');
}

main().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
