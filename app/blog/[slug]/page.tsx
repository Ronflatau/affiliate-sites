import { getAllPosts, getPost } from '@/lib/posts';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';

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
  if (!post) notFound();

  return (
    <article className="max-w-2xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex gap-2 mb-3 flex-wrap">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">{post.title}</h1>
        <p className="text-gray-600 text-lg mb-2">{post.description}</p>
        <p className="text-sm text-gray-400">Updated: {post.date}</p>
      </header>

      {/* Content */}
      <div className="prose prose-blue prose-lg max-w-none
        prose-headings:font-bold prose-headings:text-gray-900
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900
        prose-blockquote:border-blue-400 prose-blockquote:bg-blue-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded
        prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded
      ">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      {/* Affiliate disclosure */}
      <div className="mt-12 p-4 bg-gray-50 rounded-lg text-sm text-gray-500 border border-gray-200">
        <strong>Disclosure:</strong> This article contains affiliate links. We may earn a commission if you purchase through our links, at no extra cost to you. Our recommendations are independent and based on research.
      </div>

      {/* Back link */}
      <div className="mt-8">
        <a href="/blog" className="text-blue-600 hover:underline text-sm">← All articles</a>
      </div>
    </article>
  );
}
