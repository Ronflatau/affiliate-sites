import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'All Articles' };

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">All Articles</h1>
      {posts.length === 0 ? (
        <p className="text-gray-500 text-center py-16">Content coming soon. Check back tomorrow!</p>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex gap-4 border border-gray-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-sm transition-all"
            >
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900 mb-1">{post.title}</h2>
                <p className="text-sm text-gray-600 line-clamp-2">{post.description}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {post.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap mt-1">{post.date}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
