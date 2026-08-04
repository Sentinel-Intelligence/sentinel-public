import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API | Sentinel Intelligence',
  description: 'Programmatic access to the Sentinel knowledge graph is in development. Contact us for early access and research partnerships.',
  alternates: {
    canonical: 'https://sentinelintel.org/api-docs',
  },
}

export default function ApiDocsPage() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-20">
      <div className="text-cyan-500 text-xs tracking-widest uppercase mb-4">API</div>
      <h1 className="text-3xl font-bold mb-4">
        Programmatic access is <span className="text-cyan-400">in development</span>
      </h1>
      <p className="text-gray-400 mb-4 max-w-2xl">
        A public API for the Sentinel knowledge graph (legislator dossiers, trade histories,
        donation networks, conflict detection) is being built. It will launch when it meets
        the same standard as our published research: every response traceable, every figure
        verified.
      </p>
      <p className="text-gray-500 text-sm mb-10 max-w-2xl">
        Until then, nothing here is live, and we would rather say so than sell you an endpoint
        that is not ready.
      </p>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
        <div className="text-cyan-400 font-bold mb-2">Need data access now?</div>
        <p className="text-gray-400 text-sm mb-4">
          Contact us for early access, bulk data exports, or research partnerships.
        </p>
        <a
          href="mailto:api@sentinelintel.org"
          className="inline-block bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-6 py-2 rounded transition-colors text-sm"
        >
          Contact API Team
        </a>
      </div>
    </section>
  )
}
