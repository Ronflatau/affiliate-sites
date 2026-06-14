import Link from 'next/link';
import { getAllPosts, getSiteConfig } from '@/lib/posts';

export default function HomePage() {
  const posts = getAllPosts().slice(0, 9);
  const config = getSiteConfig();

  return (
    <div>
      {/* Hero */}
      <section className="text-center py-12 mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{config?.siteName}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">{config?.tagline}</p>
      </section>

      {/* Latest Articles */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Reviews & Guides</h2>
        {posts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">Content is being generated. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block border border-gray-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-md transition-all"
              >
                <p className="text-xs text-blue-600 font-medium mb-2 uppercase tracking-wide">
                  {post.tags[0] || 'Review'}
                </p>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">{post.description}</p>
                <p className="text-xs text-gray-400 mt-3">{post.date}</p>
              </Link>
            ))}
          </div>
        )}

        {posts.length >= 9 && (
          <div className="text-center mt-8">
            <Link href="/blog" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              View all articles →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
