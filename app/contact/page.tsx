import { getSiteConfig } from '@/lib/posts';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const config = getSiteConfig();
  return {
    title: `Contact | ${config?.siteName}`,
    description: `Get in touch with the ${config?.siteName} team.`,
  };
}

export default function ContactPage() {
  const config = getSiteConfig();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-black text-gray-900 mb-4">Contact Us</h1>
      <p className="text-xl text-gray-600 mb-10">
        Questions, corrections, or partnership inquiries — we read everything.
      </p>

      <div className="space-y-6 mb-12">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h2 className="font-bold text-gray-900 mb-1">Editorial corrections</h2>
          <p className="text-sm text-gray-600">
            Found a pricing error or outdated information? We want to fix it fast.
            Email us with the article URL and what needs updating.
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h2 className="font-bold text-gray-900 mb-1">Partnership inquiries</h2>
          <p className="text-sm text-gray-600">
            We do not accept paid reviews or sponsored placements.
            We participate in standard affiliate programs only.
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h2 className="font-bold text-gray-900 mb-1">General questions</h2>
          <p className="text-sm text-gray-600">
            For anything else, reach out below. We typically respond within 2 business days.
          </p>
        </div>
      </div>

      <form
        action="https://formspree.io/f/placeholder"
        method="POST"
        className="space-y-5"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent resize-none"
            placeholder="What's on your mind?"
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-3"
        >
          Send Message →
        </button>
      </form>

      <p className="text-xs text-gray-400 mt-4 text-center">
        We never share your email with third parties.
      </p>
    </div>
  );
}
