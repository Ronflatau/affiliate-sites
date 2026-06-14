import Link from 'next/link';
import { getAllPosts, getSiteConfig } from '@/lib/posts';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'All Reviews & Guides' };

export default function BlogPage() {
  const posts = getAllPosts();
  const config = getSiteConfig();

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 mb-3">All Reviews & Guides</h1>
        <p className="text-gray-500 text-lg">
          {posts.length} independent, expert-written articles — updated regularly.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">⏳</p>
          <p className="text-gray-500 text-lg">Content is being generated. Check back in 24 hours.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {posts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="card p-6 block group">
              <div className="flex items-center gap-2 mb-3">
                <span className="badge">{post.tags[0] || 'Review'}</span>
                {post.tags[1] && (
                  <span className="text-xs text-gray-400 font-medium">{post.tags[1]}</span>
                )}
              </div>
              <h2 className="font-bold text-lg text-gray-900 mb-2 leading-snug group-hover:underline line-clamp-2">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
                {post.description}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                <span>{post.date}</span>
                <span className="font-bold" style={{ color: 'var(--accent)' }}>Read review →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
