import { getSiteConfig } from '@/lib/posts';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const config = getSiteConfig();
  return {
    title: `About Us | ${config?.siteName}`,
    description: `Learn about the team behind ${config?.siteName} and how we research and review ${config?.niche}.`,
  };
}

export default function AboutPage() {
  const config = getSiteConfig();
  const author = config?.author;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-black text-gray-900 mb-4">About {config?.siteName}</h1>
      <p className="text-xl text-gray-600 mb-10 leading-relaxed">{config?.tagline}</p>

      <div className="prose max-w-none text-gray-700 leading-relaxed space-y-6 mb-12">
        <p>
          {config?.siteName} was built to cut through the noise in the {config?.niche} space.
          There are thousands of review sites online — most of them republish vendor marketing copy,
          collect affiliate commissions on everything they recommend, and update prices once a year.
          We do things differently.
        </p>
        <p>
          Every article on this site is based on direct testing or hands-on research. We verify prices
          before publishing. We include honest drawbacks alongside strengths. And we update our content
          when things change — because the {config?.niche} landscape moves fast.
        </p>
        <p>
          We are independently operated and editorially separate from any vendor. Some links on this
          site are affiliate links — if you purchase through them, we earn a small commission at no
          extra cost to you. This is how we keep the lights on. It never influences what we recommend.
        </p>
      </div>

      {author && (
        <div className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Our Team</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex items-start gap-5">
            <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-xl font-black text-gray-600 shrink-0">
              {author.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{author.name}</p>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--accent)' }}>{author.title}</p>
              <p className="text-gray-600 leading-relaxed">{author.bio}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Our Review Process</h2>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>✓ We verify current pricing directly from product pages before publishing</li>
          <li>✓ We test free trials and freemium tiers firsthand where available</li>
          <li>✓ We include drawbacks and limitations, not just positives</li>
          <li>✓ We update articles when pricing or features change significantly</li>
          <li>✓ We disclose affiliate relationships on every article</li>
        </ul>
      </div>
    </div>
  );
}
