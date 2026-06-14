import { getAllPosts, getPost, getSiteConfig } from '@/lib/posts';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: { title: post.title, description: post.description, type: 'article' },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  const config = getSiteConfig();
  if (!post) notFound();

  const wordCount = post.content.trim().split(/\s+/).length;
  const readingTime = Math.max(3, Math.ceil(wordCount / 200));

  return (
    <div className="max-w-3xl mx-auto">

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-gray-600">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-gray-600">Reviews</Link>
        <span>/</span>
        <span className="text-gray-600 truncate">{post.title}</span>
      </nav>

      {/* ── Article header ── */}
      <header className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map(tag => <span key={tag} className="badge">{tag}</span>)}
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
          {post.title}
        </h1>

        <p className="text-xl text-gray-600 mb-5 leading-relaxed">{post.description}</p>

        {/* Meta bar — authority signals */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-5 border-b border-gray-200">
          <span>📅 Updated: <strong className="text-gray-700">{post.date}</strong></span>
          <span>⏱ {readingTime} min read</span>
          <span>✓ Independent review</span>
        </div>
      </header>

      {/* ── Top affiliate CTA box (above the fold conversion) ── */}
      <div className="affiliate-box mb-8">
        <div className="flex-1">
          <p className="font-bold text-gray-900 mb-1">🏆 Looking for our top pick?</p>
          <p className="text-sm text-gray-600">
            Skip to our #1 recommendation for {config?.niche || 'this category'} — tested and verified by our team.
          </p>
        </div>
        <a href="#best-pick" className="affiliate-cta whitespace-nowrap">
          See Best Pick →
        </a>
      </div>

      {/* ── Article content ── */}
      <div className="prose-article">
        <ReactMarkdown
          components={{
            // Convert ## Best Pick or similar to anchored sections
            h2: ({ children }) => {
              const text = String(children);
              const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              const isBestPick = text.toLowerCase().includes('best') || text.toLowerCase().includes('top') || text.toLowerCase().includes('pick') || text.toLowerCase().includes('winner');
              return (
                <h2 id={id === 'best-pick' || isBestPick ? 'best-pick' : id}>
                  {isBestPick && <span className="text-yellow-500 mr-2">🏆</span>}
                  {children}
                </h2>
              );
            },
            // Style blockquotes as best-pick boxes
            blockquote: ({ children }) => (
              <div className="best-pick">
                <p className="font-bold text-sm mb-2" style={{ color: 'var(--accent)' }}>⭐ Expert Pick</p>
                {children}
              </div>
            ),
            // Make tables responsive
            table: ({ children }) => (
              <div className="overflow-x-auto my-8 rounded-xl border border-gray-200">
                <table className="w-full text-sm">{children}</table>
              </div>
            ),
            // Style links as affiliate CTAs when they contain keywords
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="nofollow noopener noreferrer"
                className="text-[var(--accent)] font-semibold hover:underline">
                {children}
              </a>
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      {/* ── Bottom affiliate CTA (Goal-gradient: end of article = highest intent) ── */}
      <div className="rounded-2xl text-white p-8 text-center mt-10"
        style={{ background: `linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)` }}>
        <p className="text-xl font-black mb-2">Ready to get started?</p>
        <p className="text-white/80 text-sm mb-5">
          Our top picks come with free trials. No risk, cancel anytime.
        </p>
        <Link href="/blog" className="inline-flex items-center gap-2 bg-white font-bold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm"
          style={{ color: 'var(--accent)' }}>
          See All Our Top Picks →
        </Link>
      </div>

      {/* ── Affiliate disclosure ── */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl text-xs text-gray-500 border border-gray-100">
        <strong>Affiliate Disclosure:</strong> Some links in this article are affiliate links.
        If you purchase through them, we earn a commission at no extra cost to you.
        This never influences our reviews — we only recommend products we genuinely believe are worth your money.
      </div>

      {/* ── Back navigation ── */}
      <div className="mt-8 flex gap-4">
        <Link href="/blog" className="btn-secondary text-sm">← All Reviews</Link>
        <Link href="/" className="btn-secondary text-sm">Home</Link>
      </div>

    </div>
  );
}
