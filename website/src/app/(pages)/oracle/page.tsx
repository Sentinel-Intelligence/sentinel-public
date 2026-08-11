import type { Metadata } from 'next'
import OracleClient from './OracleClient'

export const metadata: Metadata = {
  title: 'Oracle | Sentinel Intelligence',
  description:
    'Limited-testing natural-language lookup over ingested federal political-finance filings. Not a truth claim about filers. Check the sources.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://sentinelintel.org/oracle',
  },
}

/**
 * Public /oracle — limited-testing surface over FREE-tier POST /api/v1/oracle/query.
 * No nav link. No product or uptime promises. Results reflect ingested filings
 * with known entity-resolution gaps.
 */
export default function OraclePage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-cyan-500 text-xs tracking-widest uppercase mb-4">
        Oracle · limited testing
      </div>
      <h1 className="text-3xl font-bold mb-4">
        Ask a <span className="text-cyan-400">filing-bound</span> question
      </h1>
      <p className="text-gray-400 mb-3 text-sm leading-relaxed max-w-2xl">
        This is a limited-testing surface. Queries are rate limited. Answers are
        generated from filings we have ingested, not from live federal systems
        on every request.
      </p>
      <p className="text-gray-500 mb-10 text-sm leading-relaxed max-w-2xl">
        Results reflect known entity-resolution gaps. They are not a truth claim
        about any filer. Always check the sources.
      </p>
      <OracleClient />
    </section>
  )
}
