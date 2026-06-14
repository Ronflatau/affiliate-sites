import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getSiteConfig } from '@/lib/posts';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  const config = getSiteConfig();
  return {
    title: { default: config?.siteName || 'Review Site', template: `%s | ${config?.siteName}` },
    description: config?.tagline || '',
    openGraph: { type: 'website', siteName: config?.siteName },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const config = getSiteConfig();

  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="font-bold text-xl text-blue-600 hover:text-blue-700">
              {config?.siteName || 'Review Site'}
            </a>
            <nav className="flex gap-6 text-sm text-gray-600">
              <a href="/" className="hover:text-blue-600">Home</a>
              <a href="/blog" className="hover:text-blue-600">Articles</a>
            </nav>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8 min-h-screen">
          {children}
        </main>

        <footer className="border-t border-gray-200 mt-16">
          <div className="max-w-4xl mx-auto px-4 py-8 text-sm text-gray-500">
            <p className="mb-2">
              <strong>Affiliate Disclosure:</strong> This site contains affiliate links. If you click a link and make a purchase, we may earn a commission at no extra cost to you. We only recommend products we believe in.
            </p>
            <p>© {new Date().getFullYear()} {config?.siteName}. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
