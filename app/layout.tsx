import type { Metadata } from 'next';
import './globals.css';
import { getSiteConfig } from '@/lib/posts';

export async function generateMetadata(): Promise<Metadata> {
  const config = getSiteConfig();
  return {
    title: { default: config?.siteName || 'Review Site', template: `%s | ${config?.siteName}` },
    description: config?.hero?.subheadline || config?.tagline || '',
    openGraph: { type: 'website', siteName: config?.siteName },
    other: {
      'Impact-Site-Verification': '357611c3-131f-4655-85c5-cad13fb3f995',
      'impact-site-verification': 'e5e9c6d9-eb79-4c19-89b0-eb2e29191caf',
      'google-site-verification': '7B_IKlT94vEghsw1ywmRS9wF5xZrjjYRqTym3dxZENc',
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const config = getSiteConfig();
  const accent = config?.color?.accent || '#2563eb';
  const accentDark = config?.color?.accentDark || '#1d4ed8';
  const accentLight = config?.color?.accentLight || '#eff6ff';
  const accentRgb = config?.color?.accentRgb || '37, 99, 235';
  const trustBar: string[] = config?.trustBar || [];

  return (
    <html lang="en">
      <head>
        {/* @ts-expect-error impact verification uses non-standard value attr */}
        <meta name="impact-site-verification" value="357611c3-131f-4655-85c5-cad13fb3f995" />
        {/* @ts-expect-error impact verification uses non-standard value attr */}
        <meta name="impact-site-verification" value="e5e9c6d9-eb79-4c19-89b0-eb2e29191caf" />
        <meta name="google-site-verification" content="7B_IKlT94vEghsw1ywmRS9wF5xZrjjYRqTym3dxZENc" />
<style>{`
          :root {
            --accent: ${accent};
            --accent-dark: ${accentDark};
            --accent-light: ${accentLight};
            --accent-rgb: ${accentRgb};
          }
        `}</style>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>

        {/* ── Trust bar (Authority + Social Proof signals) ── */}
        {trustBar.length > 0 && (
          <div className="text-xs text-white py-2 text-center font-medium tracking-wide" style={{ backgroundColor: accent }}>
            {trustBar.map((item, i) => (
              <span key={i}>
                <span className="opacity-70 mx-3">✓</span>
                {item}
              </span>
            ))}
          </div>
        )}

        {/* ── Header ── */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="font-black text-xl tracking-tight hover:opacity-80 transition-opacity" style={{ color: accent }}>
              {config?.siteName || 'Review Site'}
            </a>
            <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
              <a href="/" className="hover:text-gray-900 transition-colors">Home</a>
              <a href="/blog" className="hover:text-gray-900 transition-colors">Reviews</a>
              <a href="/about" className="hover:text-gray-900 transition-colors">About</a>
              <a href="/blog" className="btn-primary text-sm py-2 px-4">Top Picks →</a>
            </nav>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="max-w-5xl mx-auto px-4 py-10 min-h-screen">
          {children}
        </main>

        {/* ── Footer ── */}
        <footer className="bg-gray-900 text-gray-400 mt-20">
          <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
              <div>
                <p className="text-white font-bold text-lg mb-2">{config?.siteName}</p>
                <p className="text-sm max-w-xs">{config?.tagline}</p>
              </div>
              <div className="flex gap-8 text-sm">
                <div>
                  <p className="text-white font-semibold mb-3">Reviews</p>
                  <a href="/blog" className="block hover:text-white mb-1">All Articles</a>
                  <a href="/" className="block hover:text-white">Home</a>
                </div>
                <div>
                  <p className="text-white font-semibold mb-3">Company</p>
                  <a href="/about" className="block hover:text-white mb-1">About Us</a>
                  <a href="/contact" className="block hover:text-white mb-1">Contact</a>
                  <a href="/privacy" className="block hover:text-white">Privacy Policy</a>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-6 text-xs space-y-2">
              <p><strong className="text-gray-300">Affiliate Disclosure:</strong> This site contains affiliate links. When you click and purchase, we may earn a commission at no extra cost to you. We only recommend products we genuinely believe in, and all reviews are independently written.</p>
              <p>© {new Date().getFullYear()} {config?.siteName}. All rights reserved.</p>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
