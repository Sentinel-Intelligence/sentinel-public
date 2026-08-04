import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Methodology | Sentinel Intelligence',
  description: 'How Sentinel ingests federal political-finance filings, binds provenance, and what we will not claim.',
  alternates: {
    canonical: 'https://sentinelintel.org/methodology',
  },
}

const PIPELINE = ['Ingest', 'Resolve', 'Graph', 'Score', 'Verify']

const DIMENSIONS = [
  'Financial Contributions',
  'Lobbying Access',
  'Committee Power',
  'Revolving Door',
  'Earmark Allocation',
  'Foreign Interests',
  'Contract Awards',
  'Regulatory Capture',
]

const DATA_SOURCES = [
  { name: 'House PTR Disclosures', desc: 'Periodic Transaction Reports — all stock trades by House members and staff' },
  { name: 'Senate eFD',            desc: 'Electronic Financial Disclosures for all sitting senators' },
  { name: 'FEC Records',           desc: 'Federal Election Commission bulk data — all campaign contributions and expenditures' },
  { name: 'Congressional Records', desc: 'Official legislative history, committee assignments, and floor votes' },
  { name: 'Lobbying Databases',    desc: 'LDA filings — all registered lobbyist activity and client relationships' },
  { name: 'FARA Filings',          desc: 'Foreign Agent Registration Act — foreign influence disclosures' },
  { name: 'Court Documents',       desc: 'PACER — federal case filings, indictments, and judgments' },
  { name: 'DOJ Releases',          desc: 'Department of Justice press releases and enforcement actions' },
  { name: 'IRS 990s',              desc: '501(c) nonprofit and dark money group filings' },
  { name: 'USAID Records',         desc: 'Foreign assistance disbursement records and contractor data' },
]

export default function MethodologyPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-cyan-500 text-xs tracking-widest uppercase mb-4">Methodology</div>
      <h1 className="text-3xl font-bold mb-10">Built on public data. Validated by science.</h1>

      {/* Pipeline */}
      <div className="mb-12">
        <h2 className="text-cyan-300 font-semibold mb-5">Ingestion Pipeline</h2>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {PIPELINE.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="bg-gray-900 border border-gray-700 px-5 py-2.5 rounded-lg font-mono text-sm font-medium text-gray-200">
                {step}
              </div>
              {i < PIPELINE.length - 1 && <span className="text-cyan-600 font-bold">→</span>}
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-xs">
          Every record flows through entity resolution, graph construction, scoring, and
          XRPL timestamping before publication.
        </p>
      </div>

      {/* 8 Influence Dimensions */}
      <div className="mb-12">
        <h2 className="text-cyan-300 font-semibold mb-5">How influence is structured in the graph</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DIMENSIONS.map(dim => (
            <div key={dim} className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center text-xs font-medium text-gray-300">
              {dim}
            </div>
          ))}
        </div>
      </div>

      {/* Data sources */}
      <div className="mb-12">
        <h2 className="text-cyan-300 font-semibold mb-4">Data Sources — 10 Federal Databases</h2>
        <div className="flex flex-wrap mb-6">
          {DATA_SOURCES.map(s => (
            <span key={s.name} className="inline-block bg-gray-800 text-cyan-400 text-xs px-3 py-1 rounded-full border border-gray-700 m-1">
              {s.name}
            </span>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {DATA_SOURCES.map(s => (
            <div key={s.name} className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex gap-3">
              <div className="text-cyan-500 mt-0.5 shrink-0">▸</div>
              <div>
                <div className="text-gray-200 font-semibold text-sm">{s.name}</div>
                <p className="text-gray-500 text-xs mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Validation */}
      <h2 className="text-cyan-300 font-semibold mb-4">Validation & Architecture</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-cyan-400 font-bold text-sm mb-1">Scoring (research use)</div>
          <p className="text-gray-400 text-sm">Influence Exposure Score integrating donation, contract, and lobbying network proximity.</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-cyan-400 font-bold text-sm mb-1">Dual-Pipeline Verification</div>
          <p className="text-gray-400 text-sm">Key statistics are computed by two independently engineered pipelines sharing only the primary government source, with persisted, hash-verified regeneration runs.</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-cyan-400 font-bold text-sm mb-1">XRPL Blockchain Provenance</div>
          <p className="text-gray-400 text-sm">Every ingestion event timestamped on XRPL. Immutable audit trail across the graph.</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-cyan-400 font-bold text-sm mb-1">Natural-language access (in development)</div>
          <p className="text-gray-400 text-sm">Natural language query interface for the knowledge graph. Offline while dedicated serving capacity is provisioned.</p>
        </div>
      </div>
    </section>
  )
}
