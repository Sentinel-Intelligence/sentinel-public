import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Graph | Sentinel Intelligence',
  description:
    'Interactive graph exploration is not offered on this public site. No unprovenanced scale totals.',
  alternates: {
    canonical: 'https://sentinelintel.org/graph',
  },
}

/**
 * Graph route retained so inbound links and sitemap do not 404 without a deliberate
 * DELETE. Content states offline capability without "coming soon" or delivery promises.
 */
export default function GraphPage() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-20 text-center">
      <div className="text-cyan-500 text-xs tracking-widest uppercase mb-4">Graph</div>
      <h1 className="text-3xl font-bold mb-4">
        Interactive graph exploration is <span className="text-cyan-400">not offered here</span>
      </h1>
      <p className="text-gray-400 mb-4 max-w-xl mx-auto text-sm leading-relaxed">
        There is no public interactive explorer on this host. We do not publish undated
        entity or edge totals as a substitute for exploration.
      </p>
      <p className="text-gray-500 text-sm mb-10 max-w-xl mx-auto leading-relaxed">
        Researchers who need a specific graph question answered from public federal data
        can contact us. That is a request path, not a product promise or uptime claim.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/methodology"
          className="inline-block bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-8 py-3 rounded transition-colors text-sm"
        >
          How verification works
        </Link>
        <a
          href="mailto:contact@sentinelintel.org"
          className="inline-block border border-cyan-800 hover:border-cyan-600 text-cyan-400 font-bold px-8 py-3 rounded transition-colors text-sm"
        >
          Contact
        </a>
      </div>
    </section>
  )
}
