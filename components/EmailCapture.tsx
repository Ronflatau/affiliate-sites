'use client';
import { useState } from 'react';

interface Props {
  siteId: string;
  niche: string;
  accentColor?: string;
}

export default function EmailCapture({ siteId, niche, accentColor = '#4f46e5' }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, siteId }),
      });
      const data = await res.json();
      setStatus(data.success ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl border-2 p-8 text-center my-10"
        style={{ borderColor: accentColor, background: `${accentColor}08` }}>
        <div className="text-3xl mb-3">✅</div>
        <p className="font-bold text-gray-900 text-lg mb-1">You&apos;re in!</p>
        <p className="text-gray-600 text-sm">
          Check your inbox — your free guide is on its way.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-8 my-10 bg-gray-50">
      <div className="max-w-md mx-auto text-center">
        <div className="text-2xl mb-3">🎁</div>
        <h3 className="font-black text-gray-900 text-xl mb-2">
          Free: The {niche} Tool Comparison Guide
        </h3>
        <p className="text-gray-600 text-sm mb-5">
          We compared 30+ tools so you don&apos;t have to. Get the full breakdown — pricing, pros, cons, our top picks — delivered free.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3 rounded-lg text-white text-sm font-bold whitespace-nowrap transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: accentColor }}
          >
            {status === 'loading' ? 'Sending...' : 'Get Free Guide →'}
          </button>
        </form>

        {status === 'error' && (
          <p className="text-red-500 text-xs mt-2">Something went wrong. Please try again.</p>
        )}

        <p className="text-xs text-gray-400 mt-3">No spam. Unsubscribe anytime.</p>
      </div>
    </div>
  );
}
