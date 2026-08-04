import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Methodology | Sentinel Intelligence',
  description:
    'How Sentinel ingests federal political-finance filings, binds provenance, and what we will not claim.',
  alternates: {
    canonical: 'https://sentinelintel.org/methodology',
  },
}

const PIPELINE = ['Ingest', 'Resolve', 'Graph', 'Bind', 'Verify']

const DATA_SOURCES = [
  { name: 'House PTR disclosures', desc: 'Periodic Transaction Reports filed by House members and covered staff' },
  { name: 'Senate eFD', desc: 'Electronic financial disclosures for senators' },
  { name: 'FEC bulk data', desc: 'Campaign contribution and expenditure records from the Federal Election Commission' },
  { name: 'Congressional records', desc: 'Legislative history, committee assignments, and related public records' },
  { name: 'LDA lobbying filings', desc: 'Registered lobbyist activity and client relationships' },
  { name: 'FARA filings', desc: 'Foreign Agent Registration Act disclosures' },
  { name: 'Federal court dockets', desc: 'Public federal case filings where used as a cited source' },
  { name: 'DOJ public releases', desc: 'Department of Justice press releases and enforcement announcements' },
  { name: 'IRS Form 990', desc: 'Public nonprofit filings when cited as a source' },
  { name: 'Federal spending records', desc: 'Public award and assistance records when cited as a source' },
]

export default function MethodologyPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-cyan-500 text-xs tracking-widest uppercase mb-4">Methodology</div>
      <h1 className="text-3xl font-bold mb-6">How records move from filing to checkable claim</h1>
      <p className="text-gray-400 text-sm leading-relaxed max-w-2xl mb-10">
        This page describes process, not performance. It does not publish accuracy rates,
        influence scores, or undated graph totals.
      </p>

      <div className="border border-cyan-900/60 bg-gray-900/80 rounded-xl p-6 mb-12">
        <div className="text-cyan-500 text-xs tracking-widest uppercase mb-3">Claim (all four travel together)</div>
        <p className="text-gray-200 text-sm leading-relaxed">
          What we show you is what we ingested. We can prove when we ingested it. We can
          prove we have not altered it since. We cannot prove the filer told the truth.
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-cyan-300 font-semibold mb-5">Pipeline stages</h2>
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
        <p className="text-gray-500 text-xs max-w-2xl leading-relaxed">
          Bind means attaching source identifiers, ingest time, and integrity hashes.
          Verify means a reader can leave Sentinel for the federal primary source when
          an id exists. No stage is marketed as a prediction score.
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-cyan-300 font-semibold mb-4">Federal source families we draw from</h2>
        <p className="text-gray-500 text-xs mb-4 max-w-2xl">
          Listing a family here does not assert complete coverage of that family on any date.
          Coverage is stated per answer when an answer cites a record.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {DATA_SOURCES.map((s) => (
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

      <h2 className="text-cyan-300 font-semibold mb-4">What we publish about verification</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-12">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-cyan-400 font-bold text-sm mb-1">Primary-source ids</div>
          <p className="text-gray-400 text-sm">
            Answers that can print a federal transaction or disclosure id do so, so a
            reader can verify without trusting Sentinel.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-cyan-400 font-bold text-sm mb-1">Ingest and integrity</div>
          <p className="text-gray-400 text-sm">
            Anchoring and hashing prove a stored artifact existed at a time and has not
            been altered since. They do not prove the underlying filing is accurate.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-cyan-400 font-bold text-sm mb-1">Dual computation when used</div>
          <p className="text-gray-400 text-sm">
            Some statistics are recomputed on independent paths sharing only the primary
            government source. When that happens, the write-up says so with the date of the run.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-cyan-400 font-bold text-sm mb-1">What is not published</div>
          <p className="text-gray-400 text-sm">
            Undated node or edge counts, retired classifier AUCs, and influence score
            leaderboards are not paper of record.
          </p>
        </div>
      </div>

      <Link
        href="/"
        className="inline-block text-cyan-500 text-sm border border-cyan-900 px-4 py-2 rounded hover:border-cyan-700 transition-colors"
      >
        Back to site claim →
      </Link>
    </section>
  )
}
