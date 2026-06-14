# Setup Guide — Do This Once, Then Forget It

## What This Is
5 affiliate content sites that auto-generate and auto-publish SEO articles every night using Claude AI.
Each site targets a different niche. You set it up once and walk away.

## The 5 Sites
| Site ID | Niche | Est. Commission |
|---------|-------|-----------------|
| ai-tools | AI Tools Reviews | $15-50/sale (recurring) |
| web-hosting | Web Hosting Reviews | $65-200/referral |
| finance | Finance Apps | $10-200/lead |
| saas-software | SaaS & Business Software | $20-200/sale (recurring) |
| home-office | Home Office Gear | $5-50/sale (Amazon) |

---

## Step 1 — Get a Claude API Key (5 min)
1. Go to console.anthropic.com
2. Sign up / log in
3. Go to API Keys → Create Key
4. Copy the key (starts with `sk-ant-...`)
5. Keep it — you'll need it in Step 3

Estimated cost: $5-15/month total for all 5 sites

---

## Step 2 — Push to GitHub (5 min)
1. Go to github.com → New Repository → Name it `affiliate-sites` → Create
2. Open a terminal in this folder (C:\Claud\affiliate-sites) and run:

```
git init
git add .
git commit -m "initial setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/affiliate-sites.git
git push -u origin main
```

---

## Step 3 — Add Your API Key to GitHub (2 min)
1. Go to your repo on GitHub
2. Settings → Secrets and variables → Actions → New repository secret
3. Name: `ANTHROPIC_API_KEY`
4. Value: paste your API key from Step 1
5. Click "Add secret"

That's all GitHub needs. The automation runs every night at 2am automatically.

---

## Step 4 — Deploy 5 Sites to Vercel (15 min)
You need to deploy the same repo 5 times, each with a different SITE_ID.

**For each site, do this:**
1. Go to vercel.com → Add New Project → Import your GitHub repo
2. Before clicking Deploy, go to "Environment Variables"
3. Add: `SITE_ID` = (one of: ai-tools, web-hosting, finance, saas-software, home-office)
4. Click Deploy

You'll have 5 Vercel projects:
- affiliate-sites-ai-tools.vercel.app
- affiliate-sites-web-hosting.vercel.app
- affiliate-sites-finance.vercel.app
- affiliate-sites-saas-software.vercel.app
- affiliate-sites-home-office.vercel.app

**Every time GitHub auto-commits new articles, Vercel auto-deploys all 5 sites.**

---

## Step 5 — Sign Up for Affiliate Programs (30 min, do this once)

### Easiest to join (approve instantly or within 24hrs):
- **Amazon Associates** → affiliate-program.amazon.com (for home-office site)
- **ShareASale** → shareasale.com (has programs for all niches)
- **Impact Radius** → impact.com (HubSpot, Canva, etc.)
- **PartnerStack** → partnerstack.com (SaaS tools)

### After joining, update the affiliate links:
The articles mention products by name. To add your real affiliate links:
- Search the content/posts folder for product mentions
- Replace plain product names with your affiliate link
- Or edit `scripts/generate.js` prompt to include your affiliate link template

---

## What Happens Every Night (Automatic)
```
2:00 AM UTC
  GitHub Action wakes up
  → Generates 3 articles for each site (15 total/night)
  → Commits them to your repo
  → Vercel detects new commit
  → Rebuilds and redeploys all 5 sites
  → New articles are live
```

After 30 days: ~450 articles across 5 sites
After 90 days: Google starts ranking them
After 120 days: First affiliate commissions arrive

---

## Revenue Timeline
| Month | Articles | Est. Monthly Traffic | Est. Revenue |
|-------|----------|---------------------|--------------|
| 1 | 90 | 200 visits | $0-20 |
| 2 | 180 | 800 visits | $20-80 |
| 3 | 270 | 2,500 visits | $100-300 |
| 4 | 360 | 6,000 visits | $300-700 |
| 5 | 450 | 12,000 visits | $600-1,500 |
| 6+ | 540+ | 20,000+ visits | $1,000-4,000+ |

---

## That's It
You never need to touch this again. The automation runs forever.
Check your affiliate dashboards once a month to see commissions.
