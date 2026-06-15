import Link from 'next/link';
import { getAllPosts, getSiteConfig } from '@/lib/posts';
import EmailCapture from '@/components/EmailCapture';

// Strip markdown links/bold from plain text display
const stripMd = (text: string) =>
  text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '');

const READING_TIME = (content?: string) => {
  if (!content) return '5 min read';
  const words = content.trim().split(/\s+/).length;
  return `${Math.max(3, Math.ceil(words / 200))} min read`;
};

export default function HomePage() {
  const posts = getAllPosts();
  const featured = posts.slice(0, 3);
  const recent = posts.slice(3, 9);
  const config = getSiteConfig();
  const hero = config?.hero;

  return (
    <div>

      {/* ── HERO — Pain-first headline (Marketing Psychology: Loss Aversion) ── */}
      <section className="rounded-3xl px-8 py-14 mb-12 text-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, var(--accent-light) 0%, white 100%)` }}>

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Social proof above headline — Bandwagon effect */}
          <p className="text-sm font-semibold mb-4 flex items-center justify-center gap-2" style={{ color: 'var(--accent)' }}>
            <span>★★★★★</span>
            <span>{hero?.socialProof || 'Trusted by thousands of readers'}</span>
          </p>

          {/* Display headline — 48-80px equivalent, pain-first */}
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-5 leading-tight">
            {hero?.headline || config?.tagline}
          </h1>

          {/* Support copy — specificity builds trust */}
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            {hero?.subheadline}
          </p>

          {/* Primary CTA — benefit-focused copy, not "click here" */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/blog" className="btn-primary text-base px-8 py-3.5">
              {hero?.cta || 'Read Expert Reviews'} →
            </Link>
            <Link href="/blog" className="btn-secondary text-base">
              Browse All Articles
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRUST SIGNALS (Authority bias — Rule of 7 touchpoints) ── */}
      <div className="grid grid-cols-3 gap-4 mb-12 text-center">
        {[
          { n: `${posts.length}+`, label: 'Expert Reviews' },
          { n: 'Weekly', label: 'Updated' },
          { n: '100%', label: 'Independent' },
        ].map(({ n, label }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-black" style={{ color: 'var(--accent)' }}>{n}</p>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* ── FEATURED ARTICLES — Visual hierarchy, card focal point ── */}
      {featured.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900">Featured Reviews</h2>
            <Link href="/blog" className="text-sm font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
              View all →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {featured.map((post, i) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="card p-5 block group">
                {/* Focal point: category badge */}
                <div className="badge mb-3">{post.tags[0] || 'Review'}</div>

                {/* Gestalt continuity: headline → description → CTA */}
                <h3 className="font-bold text-gray-900 text-base mb-2 leading-snug group-hover:underline line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">
                  {stripMd(post.description)}
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-gray-400">{post.date}</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Read →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── RECENT ARTICLES ── */}
      {recent.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Latest Reviews</h2>
          <div className="space-y-3">
            {recent.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`}
                className="card p-5 flex items-start gap-4 group block">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge text-xs">{post.tags[0] || 'Review'}</span>
                    <span className="text-xs text-gray-400">{post.date}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:underline leading-snug truncate">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{stripMd(post.description)}</p>
                </div>
                <span className="text-sm font-bold shrink-0 mt-1" style={{ color: 'var(--accent)' }}>Read →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {posts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">⏳</p>
          <p className="text-gray-500 text-lg font-medium">Content is being generated.</p>
          <p className="text-gray-400">First articles will appear within 24 hours.</p>
        </div>
      )}

      {/* ── EMAIL CAPTURE — List building (owned audience) ── */}
      <EmailCapture
        siteId={process.env.NEXT_PUBLIC_SITE_ID || ''}
        niche={config?.niche || 'software tool'}
        accentColor={config?.color?.accent}
      />

      {/* ── BOTTOM CTA — Scarcity + Reciprocity ── */}
      {posts.length > 0 && (
        <section className="rounded-2xl text-white p-10 text-center"
          style={{ background: `linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)` }}>
          <h2 className="text-2xl font-black mb-3">Don't waste money on the wrong tools</h2>
          <p className="text-white/80 mb-6">All our reviews are free, independent, and updated regularly.</p>
          <Link href="/blog" className="inline-flex items-center gap-2 bg-white font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: 'var(--accent)' }}>
            Browse All Reviews →
          </Link>
        </section>
      )}
    </div>
  );
}
