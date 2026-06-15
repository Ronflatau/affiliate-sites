/**
 * Weekly Analytics Report
 * Sends an email summary every Monday with:
 * - Total articles per site
 * - New articles this week
 * - Which sites are generating content
 * - Next steps reminder
 *
 * Requires GitHub Secrets:
 *   REPORT_EMAIL  — where to send the report (your email)
 *   RESEND_API_KEY — free at resend.com (3,000 emails/month free)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const REPORT_EMAIL = process.env.REPORT_EMAIL;

const SITES = [
  { id: 'ai-tools', name: 'AI Tools Review', url: 'https://affiliate-ai-tools-three.vercel.app' },
  { id: 'web-hosting', name: 'Hosting Advisor', url: 'https://affiliate-web-hosting.vercel.app' },
  { id: 'finance', name: 'Smart Money Tools', url: 'https://affiliate-finance-gamma.vercel.app' },
  { id: 'saas-software', name: 'SaaS Stack Reviews', url: 'https://affiliate-saas-pi.vercel.app' },
  { id: 'home-office', name: 'Home Office HQ', url: 'https://affiliate-home-office.vercel.app' },
];

async function getSiteStats(siteId) {
  const postsDir = path.join(ROOT, 'content', 'posts');
  let files = [];
  try {
    files = await fs.readdir(postsDir);
  } catch {
    return { total: 0, thisWeek: 0 };
  }

  const siteFiles = files.filter(f => f.startsWith(`${siteId}-`) && f.endsWith('.mdx'));
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  let thisWeek = 0;
  for (const file of siteFiles) {
    const stat = await fs.stat(path.join(postsDir, file));
    if (stat.mtimeMs > weekAgo) thisWeek++;
  }

  return { total: siteFiles.length, thisWeek };
}

function buildEmailHTML(stats, weekNumber) {
  const totalArticles = stats.reduce((sum, s) => sum + s.total, 0);
  const totalNew = stats.reduce((sum, s) => sum + s.thisWeek, 0);
  const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const siteRows = stats.map(s => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0">
        <strong>${s.name}</strong><br>
        <a href="${s.url}" style="color:#6366f1;font-size:12px">${s.url}</a>
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;font-weight:bold">${s.total}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;color:${s.thisWeek > 0 ? '#059669' : '#9ca3af'};font-weight:bold">+${s.thisWeek}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1f2937">

  <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:24px;border-radius:12px;margin-bottom:24px;color:white;text-align:center">
    <h1 style="margin:0;font-size:22px">📊 Weekly Affiliate Report</h1>
    <p style="margin:8px 0 0;opacity:0.85;font-size:14px">Week ${weekNumber} · ${date}</p>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;text-align:center">
      <p style="margin:0;font-size:32px;font-weight:900;color:#059669">${totalArticles}</p>
      <p style="margin:4px 0 0;font-size:13px;color:#065f46">Total Articles</p>
    </div>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;text-align:center">
      <p style="margin:0;font-size:32px;font-weight:900;color:#2563eb">+${totalNew}</p>
      <p style="margin:4px 0 0;font-size:13px;color:#1e40af">New This Week</p>
    </div>
  </div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:white;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">
    <thead>
      <tr style="background:#f9fafb">
        <th style="padding:10px 12px;text-align:left;font-size:13px;color:#6b7280">Site</th>
        <th style="padding:10px 12px;text-align:center;font-size:13px;color:#6b7280">Total</th>
        <th style="padding:10px 12px;text-align:center;font-size:13px;color:#6b7280">This Week</th>
      </tr>
    </thead>
    <tbody>${siteRows}</tbody>
  </table>

  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px;margin-bottom:24px">
    <h3 style="margin:0 0 10px;font-size:15px;color:#92400e">📋 This Week's Action Items</h3>
    <ul style="margin:0;padding-left:20px;font-size:14px;color:#78350f;line-height:1.8">
      <li>Check Google Search Console — are your articles getting indexed?</li>
      <li>Apply to PartnerStack if not done yet (same-day approvals)</li>
      <li>Replace placeholder affiliate-links.json URLs with real tracked links</li>
      <li>Submit sitemap to Google Search Console for each site</li>
    </ul>
  </div>

  <div style="background:#f3f4f6;border-radius:10px;padding:16px;font-size:13px;color:#6b7280;text-align:center">
    <p style="margin:0">This report was auto-generated by your affiliate content automation system.</p>
    <p style="margin:4px 0 0">Sites running on Vercel · Content generated by Claude Haiku · Report by GitHub Actions</p>
  </div>

</body>
</html>`;
}

async function sendEmail(html, totalNew) {
  if (!RESEND_API_KEY || !REPORT_EMAIL) {
    console.log('[weekly-report] No email config — printing report to console only');
    console.log(html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Affiliate Bot <report@yourdomain.com>', // Update with your domain in Resend
      to: [REPORT_EMAIL],
      subject: `📊 Weekly Report: +${totalNew} new articles this week`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Resend error: ${JSON.stringify(err)}`);
  }

  console.log(`✓ Weekly report sent to ${REPORT_EMAIL}`);
}

async function main() {
  console.log('\n=== Weekly Analytics Report ===');

  const weekNumber = Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));

  const stats = [];
  for (const site of SITES) {
    const s = await getSiteStats(site.id);
    stats.push({ ...site, ...s });
    console.log(`${site.name}: ${s.total} total, +${s.thisWeek} this week`);
  }

  const totalNew = stats.reduce((sum, s) => sum + s.thisWeek, 0);
  const html = buildEmailHTML(stats, weekNumber);

  await sendEmail(html, totalNew);
  console.log('\n✓ Done');
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
