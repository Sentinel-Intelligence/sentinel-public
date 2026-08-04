import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'API | Sentinel Intelligence',
  description:
    'No public API is offered on this site today. Contact for research data requests.',
  alternates: {
    canonical: 'https://sentinelintel.org/api-docs',
  },
}

/**
 * Retained route for inbound links. Does not advertise endpoints, pricing tiers,
 * or launch timelines (no coming-soon, no delivery guarantees).
 */
export default function ApiDocsPage() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-20">
      <div className="text-cyan-500 text-xs tracking-widest uppercase mb-4">API</div>
      <h1 className="text-3xl font-bold mb-4">
        No public API is offered <span className="text-cyan-400">on this site today</span>
      </h1>
      <p className="text-gray-400 mb-4 max-w-2xl text-sm leading-relaxed">
        There is no live programmatic endpoint advertised here, and no rate card. We would
        rather leave this blank than describe a service that is not ready to stand behind
        the site claim.
      </p>
      <p className="text-gray-500 text-sm mb-10 max-w-2xl leading-relaxed">
        What we show you is what we ingested. We can prove when we ingested it. We can
        prove we have not altered it since. We cannot prove the filer told the truth. Any
        future API must carry that limit inside the answer unit.
      </p>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center mb-8">
        <div className="text-cyan-400 font-bold mb-2">Research data requests</div>
        <p className="text-gray-400 text-sm mb-4">
          For bulk exports or research partnerships, email us. Response is not guaranteed
          on a SLA.
        </p>
        <a
          href="mailto:api@sentinelintel.org"
          className="inline-block bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-6 py-2 rounded transition-colors text-sm"
        >
          api@sentinelintel.org
        </a>
      </div>
      <Link href="/" className="text-cyan-500 text-sm hover:text-cyan-400">
        ← Site claim
      </Link>
    </section>
  )
}
