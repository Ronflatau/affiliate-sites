import { getSiteConfig } from '@/lib/posts';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const config = getSiteConfig();
  return {
    title: `Privacy Policy | ${config?.siteName}`,
    description: `Privacy policy for ${config?.siteName}.`,
  };
}

export default function PrivacyPage() {
  const config = getSiteConfig();
  const updated = '2026-06-15';

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-black text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: {updated}</p>

      <div className="prose max-w-none text-gray-700 leading-relaxed space-y-8">

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. Who We Are</h2>
          <p>
            {config?.siteName} operates this website. We publish independent reviews and comparisons
            of {config?.niche}. Our contact email is listed on our{' '}
            <a href="/contact" className="text-[var(--accent)] hover:underline">Contact page</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
          <p>We collect information you voluntarily provide, including:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Email address if you subscribe to our newsletter</li>
            <li>Name and message if you contact us</li>
          </ul>
          <p className="mt-3">
            We also automatically collect standard server logs and analytics data (pages visited,
            time on page, browser type, general location) via Google Analytics 4.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. Affiliate Links</h2>
          <p>
            This site participates in affiliate programs. When you click a link to a product and
            make a purchase, we may earn a commission at no extra cost to you. Affiliate relationships
            do not influence our editorial recommendations. We disclose affiliate links on every article.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Cookies</h2>
          <p>
            We use cookies for analytics (Google Analytics) and to remember your preferences.
            You can disable cookies in your browser settings. Disabling cookies may affect site functionality.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Third-Party Services</h2>
          <p>We use the following third-party services that may process your data:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Google Analytics 4 — usage analytics</li>
            <li>Mailchimp — email newsletter (if you subscribe)</li>
            <li>Vercel — website hosting</li>
          </ul>
          <p className="mt-3">Each service operates under its own privacy policy.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">6. Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data at any time
            by contacting us. EU/EEA residents have additional rights under GDPR.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">7. Contact</h2>
          <p>
            For privacy-related questions, use our{' '}
            <a href="/contact" className="text-[var(--accent)] hover:underline">Contact page</a>.
          </p>
        </section>

      </div>
    </div>
  );
}
