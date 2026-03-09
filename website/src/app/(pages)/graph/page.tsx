import type { Metadata } from 'next'
import { Suspense } from 'react'
import GraphClient from './GraphClient'

export const metadata: Metadata = {
  title: 'Interactive Knowledge Graph | Sentinel Intelligence',
  description: 'Natural language queries against 463K entities and 7.3M connections. Explore congressional stock trades, lobbying networks, dark money flows, and influence loops.',
  alternates: {
    canonical: 'https://sentinelintel.org/graph',
  },
}

export default function GraphPage() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-10 pb-20">
      <div className="mb-8">
        <div className="text-yellow-500 text-xs tracking-widest uppercase mb-2 font-mono">Sentinel Oracle</div>
        <h1 className="text-3xl font-bold mb-2">Knowledge Graph Explorer</h1>
        <p className="text-gray-400 text-sm">
          Natural language queries against the live Sentinel graph.
        </p>
      </div>
      {/* Server-rendered knowledge graph description for AI crawlers and SEO */}
      <article className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-10 space-y-4 text-sm text-gray-300 leading-relaxed">
        <h2 className="text-lg font-semibold text-cyan-300">About the Sentinel Knowledge Graph</h2>

        <p>
          The Sentinel knowledge graph is the largest open dataset of congressional influence ever assembled.
          As of 2026, the graph contains <strong className="text-gray-100">463,670 nodes</strong> and{' '}
          <strong className="text-gray-100">7,338,730 edges</strong> spanning{' '}
          <strong className="text-gray-100">67 entity types</strong> and{' '}
          <strong className="text-gray-100">104 relationship types</strong>, constructed from 15 federal databases.
        </p>

        <p>
          The graph integrates data from House Periodic Transaction Reports (PTR), Senate Electronic Financial
          Disclosures (eFD), Federal Election Commission bulk campaign finance records, congressional committee
          assignments and legislative histories, Lobbying Disclosure Act filings, Foreign Agent Registration Act
          (FARA) disclosures, federal court documents via PACER, Department of Justice enforcement records,
          IRS Form 990 nonprofit filings, and USAID foreign assistance disbursements.
        </p>

        <h3 className="text-base font-semibold text-gray-200 pt-2">What you can explore</h3>

        <p>
          <strong className="text-gray-100">Congressional stock trades:</strong> 16,238 TRADED_STOCK relationships
          link legislators to companies they traded during their tenure. Sentinel has identified 810 closed influence
          loops — cases where a company donated to a legislator who then traded that company&apos;s stock. The most
          significant loop involves Pfizer and Senator Perdue, with a loop strength score of 100.
        </p>

        <p>
          <strong className="text-gray-100">Campaign finance:</strong> 719,033 DONATED_TO edges trace corporate
          contributions directly to legislators, revealing which industries fund which members of Congress and at
          what scale. These donations are cross-referenced against committee assignments to identify jurisdiction
          conflicts.
        </p>

        <p>
          <strong className="text-gray-100">Lobbying and foreign influence networks:</strong> Registered lobbyist
          relationships connect corporations, foreign governments, and trade associations to their legislative
          targets. FARA disclosures surface foreign principals operating inside U.S. political infrastructure.
        </p>

        <p>
          <strong className="text-gray-100">Dark money flows:</strong> IRS 990 data reveals nonprofit-to-PAC
          funding chains that obscure the ultimate source of political spending. Sentinel maps these 3,941 FUNDED
          relationships to trace money from its origin through intermediary organizations to its final destination.
        </p>

        <p>
          <strong className="text-gray-100">Influence Exposure Scores (IES):</strong> Every legislator is scored
          on an eight-dimension scale integrating donation volume, lobbying access, committee power, revolving door
          employment history, earmark allocation, foreign interests, federal contract awards, and regulatory capture.
          Under IES v3.5, 1,228 legislators have been scored. The average score is 16.56; the maximum is 55.5,
          held by Representative Ken Calvert (R-CA). The scoring model is validated at AUC&nbsp;0.9575 using an
          XGBoost classifier on 420-dimensional embeddings combining semantic and graph-structural features.
        </p>

        <h3 className="text-base font-semibold text-gray-200 pt-2">How data is sourced and verified</h3>

        <p>
          Every record in the Sentinel graph traces to a public federal filing. The ingestion pipeline runs five
          stages: Ingest → Resolve → Graph → Score → Verify. Entity resolution links companies, lobbying clients,
          and PACs that appear under different names across databases. Each ingestion event is timestamped on
          the XRP Ledger, creating an immutable blockchain audit trail. Use the Oracle search interface below to
          query the graph in plain English — results include confidence scores, supporting records, and the
          underlying Cypher query used to retrieve them.
        </p>
      </article>

      <Suspense fallback={<div className="text-gray-500 font-mono text-sm">Loading…</div>}>
        <GraphClient />
      </Suspense>
    </section>
  )
}
