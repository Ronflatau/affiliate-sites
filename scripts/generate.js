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

// Detect article type from keyword for content calendar variety
function detectArticleType(keyword) {
  const kw = keyword.toLowerCase();
  if (kw.includes(' vs ') || kw.includes(' versus ')) return 'comparison';
  if (kw.includes('best ') || kw.includes(' best')) return 'best-of';
  if (kw.includes('review')) return 'review';
  if (kw.includes('how to') || kw.includes('guide') || kw.includes('tutorial')) return 'howto';
  if (kw.includes('alternative') || kw.includes('alternatives')) return 'alternatives';
  if (kw.includes('pricing') || kw.includes('price') || kw.includes('cost')) return 'pricing';
  return 'review'; // default
}

// Build article type-specific prompt additions (council: comparison = 33% of AI citations)
function getArticleTypeInstructions(type, keyword, products) {
  const productList = products.slice(0, 3).join(', ');

  switch (type) {
    case 'comparison':
      return `
ARTICLE TYPE: Comparison (highest-converting format)
Structure MUST be:
1. Opening paragraph with 40-60 word direct answer: "The quick answer is: [Product A] is better for X, [Product B] is better for Y."
2. ## Quick Verdict (summary table with 5 criteria, winner per row)
3. ## Best Pick (winner callout with specific reason)
4. ## [Product A] Review (pricing, pros, cons, who it's for)
5. ## [Product B] Review (pricing, pros, cons, who it's for)
6. ## Head-to-Head: Key Differences (comparison table)
7. ## Who Should Choose Which (decision framework)
8. ## FAQ (3 questions people actually ask)
Include REAL pricing tiers (e.g. "Free plan, Pro at $X/month, Business at $Y/month") — research typical pricing for these tools.`;

    case 'best-of':
      return `
ARTICLE TYPE: Best-of Listicle (high buying intent)
Structure MUST be:
1. Opening paragraph with 40-60 word direct answer listing top 3 picks immediately
2. ## Quick Picks Table (product name, best for, price, rating out of 5)
3. ## Best Pick (our #1 recommendation with specific reason)
4. ## [Top 5-7 Products] — one H3 section each with: price, pros, cons, who it's for, verdict
5. ## How We Chose These (methodology — builds trust)
6. ## FAQ (3 questions)
Include specific pricing for each product. Use star ratings (⭐⭐⭐⭐⭐) per product.`;

    case 'howto':
      return `
ARTICLE TYPE: How-To Guide with Product Recommendation
Structure MUST be:
1. Opening paragraph with 40-60 word direct answer: "Here's how to [task] in [X] steps:"
2. ## What You'll Need (list tools/products needed — natural affiliate placement)
3. ## Best Pick (recommended tool for this task)
4. ## Step-by-Step Guide (numbered steps, H3 per step)
5. ## Common Mistakes to Avoid
6. ## FAQ (3 questions)
Recommend ${productList} naturally within the steps as the tools to use.`;

    case 'alternatives':
      return `
ARTICLE TYPE: Alternatives Article (high commercial intent)
Structure MUST be:
1. Opening paragraph with 40-60 word direct answer: "The best alternatives to [product] are: [list top 3]"
2. ## Why People Look for Alternatives (pain points)
3. ## Best Pick Alternative (our top recommendation)
4. ## Top [5-7] Alternatives (H3 per product with price, pros, cons, best for)
5. ## Comparison Table (all alternatives vs original)
6. ## How to Choose the Right One
7. ## FAQ (3 questions)`;

    case 'pricing':
      return `
ARTICLE TYPE: Pricing Breakdown (transactional intent)
Structure MUST be:
1. Opening paragraph with 40-60 word direct answer: "[Product] pricing starts at $X/month for [plan]."
2. ## Pricing Plans Table (plan name, price, features, who it's for)
3. ## Best Value Pick (which plan we recommend and why)
4. ## Is It Worth the Price? (honest assessment)
5. ## How [Product] Compares on Price (vs top 2 competitors)
6. ## How to Get the Best Deal (discounts, free trials, annual savings)
7. ## FAQ (3 questions about pricing)
Include specific dollar amounts for all pricing tiers.`;

    default: // review
      return `
ARTICLE TYPE: Product Review
Structure MUST be:
1. Opening paragraph with 40-60 word direct answer: "[Product] is [verdict] for [audience]. Here's what you need to know."
2. ## Best Pick (is this the right choice? quick verdict)
3. ## What Is [Product]? (40-60 word definition block — great for AI citation)
4. ## Key Features (H3 per feature with honest assessment)
5. ## Pricing (specific tiers with dollar amounts)
6. ## Pros and Cons (bullet lists)
7. ## Who Should Use [Product] (and who shouldn't)
8. ## [Product] vs Top Alternatives (mini comparison table)
9. ## FAQ (3 questions)`;
  }
}

// Inject affiliate links into content after generation
async function injectAffiliateLinks(content, siteId) {
  try {
    const linksPath = path.join(ROOT, 'public', 'affiliate-links.json');
    const linksData = JSON.parse(await fs.readFile(linksPath, 'utf8'));
    const links = linksData[siteId] || {};
    let injected = content;

    for (const [product, url] of Object.entries(links)) {
      // Only replace first plain-text occurrence (skip if already a markdown link)
      const regex = new RegExp(`(?<!\\[)\\b${product.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b(?![^[]*\\])`, '');
      injected = injected.replace(regex, `[${product}](${url})`);
    }
    return injected;
  } catch {
    return content; // fail silently, return original
  }
}

async function generateArticle(keyword, config) {
  console.log(`  Generating: "${keyword}"`);

  const today = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();
  const productsText = config.affiliateProducts.slice(0, 6).join(', ');
  const articleType = detectArticleType(keyword);
  const typeInstructions = getArticleTypeInstructions(articleType, keyword, config.affiliateProducts);

  console.log(`  Article type: ${articleType}`);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `You are an expert ${config.niche} blogger and reviewer writing in ${currentYear}. Write a comprehensive, genuinely helpful, SEO-optimized article that gets cited by Google AI, ChatGPT, and Perplexity.

IMPORTANT: The current year is ${currentYear}. Use ${currentYear} in the title and throughout — NEVER write 2024 or any past year.

Topic: "${keyword}"
Site niche: ${config.niche}
Affiliate products to naturally recommend (pick 2-3 most relevant): ${productsText}

${typeInstructions}

UNIVERSAL REQUIREMENTS (apply to all article types):
- Word count: 1200-1500 words
- Every H2 section must START with a 40-60 word self-contained answer block (works without surrounding context — this is how AI systems cite content)
- Include at least 3 specific statistics or data points with context (e.g. "Studies show X% of users..." or "The average cost is $X...")
- Include REAL pricing information — research typical market prices for the products mentioned
- Every product recommendation must include: price range, who it's best for, one specific differentiator
- Use honest pros AND cons — never only positive
- Internal link suggestion: mention "see our full [related topic] guide" once naturally
- All years mentioned must be ${currentYear}

AI SEO OPTIMIZATION:
- Use exact question phrases as H2/H3 headers (e.g. "Is [Product] Worth It?", "What Does [Product] Cost?")
- End with a ## Frequently Asked Questions section with exactly 3 questions and detailed answers
- Each FAQ answer should be 40-60 words — self-contained and directly answerable

Respond ONLY with valid MDX in this exact format (no extra text before or after):

---
title: "YOUR TITLE HERE (include ${currentYear})"
description: "YOUR META DESCRIPTION HERE (150-160 chars, include primary keyword)"
date: "${today}"
lastVerified: "${today}"
siteId: "${SITE_ID}"
author: "${config.author?.name || 'Editorial Team'}"
authorTitle: "${config.author?.title || 'Staff Writer'}"
tags: ["tag1", "tag2", "tag3", "tag4", "tag5"]
---

[article content here — IMPORTANT: after the opening paragraph but before any H2, include this exact line:]
> **Disclosure:** This article contains affiliate links. We may earn a commission at no extra cost to you. Prices verified as of ${today} — check the product site for current pricing.`
    }]
  });

  // Strip markdown code fences if model wraps output
  let text = message.content[0].text.trim();
  text = text.replace(/^```(?:mdx)?\n/, '').replace(/\n```$/, '');
  text = text.trim();

  // Inject affiliate links
  text = await injectAffiliateLinks(text, SITE_ID);

  return text;
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

  console.log(`\n=== Affiliate Content Generator v2.0 ===`);
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
