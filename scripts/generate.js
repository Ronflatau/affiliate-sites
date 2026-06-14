import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const SITE_ID = process.env.SITE_ID;
const ARTICLES_PER_RUN = parseInt(process.env.ARTICLES_PER_RUN || '3');

async function loadConfig() {
  const configPath = path.join(ROOT, 'configs', `${SITE_ID}.config.json`);
  return JSON.parse(await fs.readFile(configPath, 'utf8'));
}

async function loadUsedKeywords() {
  const trackingFile = path.join(ROOT, 'content', 'posts', `.used-keywords-${SITE_ID}.json`);
  try {
    return JSON.parse(await fs.readFile(trackingFile, 'utf8'));
  } catch {
    return [];
  }
}

async function saveUsedKeywords(used) {
  const trackingFile = path.join(ROOT, 'content', 'posts', `.used-keywords-${SITE_ID}.json`);
  await fs.writeFile(trackingFile, JSON.stringify(used, null, 2));
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function generateArticle(keyword, config) {
  console.log(`  Generating: "${keyword}"`);

  const today = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();
  const productsText = config.affiliateProducts.slice(0, 6).join(', ');

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: `You are an expert ${config.niche} blogger writing in ${currentYear}. Write a comprehensive, helpful, SEO-optimized blog post.

IMPORTANT: The current year is ${currentYear}. Use ${currentYear} in the title and throughout — NEVER write 2024 or any past year.

Topic: "${keyword}"
Site niche: ${config.niche}
Affiliate products to naturally recommend (pick 2-3 most relevant): ${productsText}

Requirements:
- Word count: 1100-1400 words
- Helpful, honest, and genuinely useful to the reader
- Include a clear recommendation with affiliate call-to-action (e.g. "Check current pricing →" or "Start free trial →")
- Use H2 and H3 headers for structure
- Include a "## Best Pick" section near the top with a specific tool recommendation
- End with a FAQ section (3 questions)
- Generate 5 relevant tags
- All years mentioned must be ${currentYear}

Respond ONLY with valid MDX in this exact format (no extra text before or after):

---
title: "YOUR TITLE HERE"
description: "YOUR META DESCRIPTION HERE (150-160 chars)"
date: "${today}"
siteId: "${SITE_ID}"
tags: ["tag1", "tag2", "tag3", "tag4", "tag5"]
---

[article content here]`
    }]
  });

  // Strip markdown code fences if model wraps output in ```mdx ... ```
  let text = message.content[0].text.trim();
  text = text.replace(/^```(?:mdx)?\n/, '').replace(/\n```$/, '');
  return text.trim();
}

async function articleExists(slug) {
  const filePath = path.join(ROOT, 'content', 'posts', `${SITE_ID}-${slug}.mdx`);
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!SITE_ID) {
    console.error('ERROR: SITE_ID environment variable is required');
    process.exit(1);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY environment variable is required');
    process.exit(1);
  }

  console.log(`\n=== Affiliate Content Generator ===`);
  console.log(`Site: ${SITE_ID}`);
  console.log(`Articles per run: ${ARTICLES_PER_RUN}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  const config = await loadConfig();
  const usedKeywords = await loadUsedKeywords();

  const availableKeywords = config.keywords.filter(k => !usedKeywords.includes(k));

  if (availableKeywords.length === 0) {
    console.log('All keywords exhausted — resetting keyword list');
    await saveUsedKeywords([]);
    return;
  }

  // Pick random keywords from available pool
  const shuffled = availableKeywords.sort(() => Math.random() - 0.5);
  const toGenerate = shuffled.slice(0, Math.min(ARTICLES_PER_RUN, availableKeywords.length));

  console.log(`Keywords to generate: ${toGenerate.join(', ')}\n`);

  const newlyUsed = [...usedKeywords];

  for (const keyword of toGenerate) {
    const slug = slugify(keyword);

    if (await articleExists(slug)) {
      console.log(`  Skipping (already exists): ${slug}`);
      continue;
    }

    try {
      const content = await generateArticle(keyword, config);
      const filePath = path.join(ROOT, 'content', 'posts', `${SITE_ID}-${slug}.mdx`);
      await fs.writeFile(filePath, content, 'utf8');
      newlyUsed.push(keyword);
      console.log(`  ✓ Saved: ${SITE_ID}-${slug}.mdx`);

      // Delay between API calls to avoid rate limiting
      if (toGenerate.indexOf(keyword) < toGenerate.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (err) {
      console.error(`  ✗ Failed: ${keyword} — ${err.message}`);
    }
  }

  await saveUsedKeywords(newlyUsed);
  console.log(`\n✓ Done. Total articles generated this run: ${toGenerate.length}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
