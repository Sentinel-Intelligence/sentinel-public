import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Methodology | Sentinel Intelligence',
  description:
    'How Sentinel ingests federal political-finance filings, binds provenance, and what we will not claim. Per-source coverage dates from a measured graph snapshot.',
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

/**
 * Coverage table from D-2026-08-06-GB-FRESHNESS-CENSUS measurements_v2.json
 * (sha256 2391eae2…). Measured 2026-08-05 UTC. Fixed snapshot, not live.
 * No promises about refresh. Public source labels only (no internal stack names).
 */
const COVERAGE_MEASURED_ON = '2026-08-05'
const COVERAGE_MEASURED_TZ = 'UTC'

type CoverageRow = {
  source: string
  population: string
  newestRecord: string
  grain: string
  newestIngestedAt: string
  boundary: string
}

const COVERAGE_ROWS: CoverageRow[] = [
  {
    source: 'FEC contributions',
    population: '1,311,097 edges',
    newestRecord:
      'Election cycle 2026 only. No day-level contribution date on these records. Cycle year is not a calendar-day freshness claim.',
    grain: 'cycle (year)',
    newestIngestedAt: '2026-08-03',
    boundary:
      'Coarse grain. A cycle of 2026 means some 2026-cycle bulk is present, not that coverage runs through any specific day in 2026.',
  },
  {
    source: 'FEC independent expenditures',
    population: '60 nodes',
    newestRecord: '2025-01-06 (expenditure date)',
    grain: 'day',
    newestIngestedAt: '2026-03-01',
    boundary: '576 days behind measurement date on record date. Small population (n=60).',
  },
  {
    source: 'FARA agents',
    population: '7,022 nodes',
    newestRecord: '2026-02-12 (registration date)',
    grain: 'day',
    newestIngestedAt: 'Not present on these nodes',
    boundary: '174 days behind measurement date on registration date.',
  },
  {
    source: 'FARA foreign principals',
    population: '12,482 nodes',
    newestRecord: 'No date property on these nodes',
    grain: 'none',
    newestIngestedAt: 'Not present on these nodes',
    boundary: 'No usable record date or ingest stamp to publish as a coverage date.',
  },
  {
    source: 'SEC Form 4 (insider trades)',
    population: '7,158 edges',
    newestRecord: '2026-02-26 (transaction date)',
    grain: 'day',
    newestIngestedAt: '2026-02-27',
    boundary: '160 days behind measurement date on record date. Form 4 is a continuous two-business-day filing regime.',
  },
  {
    source: 'SEC enforcement actions',
    population: '1,475 nodes',
    newestRecord: '2026-02-12 (node write time, field created)',
    grain: 'write-time',
    newestIngestedAt: '2026-02-12',
    boundary: '174 days behind measurement date. Date is write-time, not a separate federal filing date field.',
  },
  {
    source: 'Lobbying disclosures',
    population: '325,653 edges',
    newestRecord:
      'Max non-null year is 2024, on 5 edges only. 325,618 edges have year unset (null).',
    grain: 'year (sparse)',
    newestIngestedAt: 'Not present on these edges',
    boundary:
      'Too coarse and too incomplete for a single useful coverage date. Do not read as coverage through 2024-12-31.',
  },
  {
    source: 'Lobbyist registry nodes',
    population: '47,793 nodes',
    newestRecord: '2026-02-14 (node write time, field created)',
    grain: 'write-time',
    newestIngestedAt: '2026-02-14',
    boundary: '172 days behind measurement date. Write-time is not a disclosure filing date.',
  },
  {
    source: 'USAspending federal contracts',
    population: '32,362,226 nodes (as of measurement)',
    newestRecord: '2026-03-01 (award start date, dates after measurement day excluded)',
    grain: 'day',
    newestIngestedAt: 'Not present on the measured path',
    boundary: '157 days behind measurement date on start date. Population count is the series size at measurement, not a promotional total.',
  },
  {
    source: 'USAspending awards (limited subset)',
    population: '15,862 nodes',
    newestRecord: '2025-09-30 (award start date)',
    grain: 'day',
    newestIngestedAt: '2026-08-04',
    boundary:
      'Subset population only; not a replacement for the full contracts series above. Record start dates lag; ingest stamp is 2026-08-04.',
  },
  {
    source: 'Earmarks / community project funding',
    population: '16,764 nodes',
    newestRecord: 'Fiscal year 2026 (8,527 of 16,764 rows)',
    grain: 'fiscal year',
    newestIngestedAt: '2026-02-14',
    boundary:
      'Fiscal-year grain only. FY2026 means appropriations year labels are present, not day-level coverage through the measurement date.',
  },
  {
    source: 'STOCK Act PTR (House)',
    population: '21,267 active edges (House source tag)',
    newestRecord: '2026-07-20 (transaction date; three future-garbage dates excluded)',
    grain: 'day',
    newestIngestedAt: '2026-07-29',
    boundary: '16 days behind measurement date on transaction date.',
  },
  {
    source: 'STOCK Act PTR (Senate)',
    population: '7,960 active edges (Senate source tag)',
    newestRecord: '2021-02-16 (transaction date)',
    grain: 'day',
    newestIngestedAt: 'Not present on these edges',
    boundary: 'Years behind measurement date (newest transaction 2021-02-16).',
  },
  {
    source: 'Congressional travel disclosures',
    population: '1,778 nodes',
    newestRecord: 'No start or end date on measured nodes',
    grain: 'none on record',
    newestIngestedAt: '2026-02-11 (ingest stamp field)',
    boundary: '175 days behind measurement date on ingest stamp. No usable trip date field in the measured population.',
  },
  {
    source: 'USAID contracts',
    population: '14,446 nodes',
    newestRecord: '2026-02-10 (contract start date; far-future end dates excluded)',
    grain: 'day',
    newestIngestedAt: 'Not present on these nodes',
    boundary: '176 days behind measurement date on start date.',
  },
  {
    source: 'Filed disclosure (single relationship present)',
    population: '1 edge',
    newestRecord: 'Period text only; no day-resolution field',
    grain: 'period text',
    newestIngestedAt: '2026-04-14',
    boundary: '113 days behind measurement date on ingest stamp. Population is a single edge.',
  },
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

      {/* Coverage dates: measured snapshot */}
      <div id="coverage-dates" className="mb-14 scroll-mt-24">
        <h2 className="text-cyan-300 font-semibold mb-3">Coverage dates by source</h2>
        <p className="text-gray-300 text-sm leading-relaxed max-w-3xl mb-3">
          Coverage dates vary by source. The graph is built from federal filings on an
          ingestion schedule, not in real time, and some series are months behind their
          sources. We publish what we ingested and when.
        </p>
        <p className="text-gray-400 text-sm leading-relaxed max-w-3xl mb-3">
          Table measured <span className="text-gray-200 font-mono">{COVERAGE_MEASURED_ON}</span>{' '}
          ({COVERAGE_MEASURED_TZ}) against the live graph and on-disk ingest artifacts.
          This is a fixed snapshot, not a live query. Loading this page does not remeasure
          the graph. Days-behind figures use that measurement date as the anchor.
        </p>
        <p className="text-gray-500 text-xs leading-relaxed max-w-3xl mb-6">
          Grain tells you what the date means: day is a calendar date on the record;
          cycle or fiscal year is coarser; write-time is when the node was written, not a
          federal filing date; none means no usable date field was present. Newest record
          dates exclude impossible future values (for example, transaction dates after the
          measurement day).
        </p>

        <div className="overflow-x-auto border border-gray-800 rounded-lg">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-gray-900 text-cyan-500 uppercase tracking-wider text-[10px] md:text-xs">
              <tr>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Source</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Population</th>
                <th className="px-3 py-3 font-semibold">Newest record</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Grain</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Newest ingested_at</th>
                <th className="px-3 py-3 font-semibold">Boundary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {COVERAGE_ROWS.map((row) => (
                <tr key={row.source} className="bg-gray-950/80 align-top">
                  <td className="px-3 py-3 text-gray-100 font-medium whitespace-nowrap">{row.source}</td>
                  <td className="px-3 py-3 text-gray-400 font-mono whitespace-nowrap">{row.population}</td>
                  <td className="px-3 py-3 text-gray-200 max-w-xs leading-relaxed">{row.newestRecord}</td>
                  <td className="px-3 py-3 text-cyan-400/90 font-mono whitespace-nowrap">{row.grain}</td>
                  <td className="px-3 py-3 text-gray-300 font-mono whitespace-nowrap">{row.newestIngestedAt}</td>
                  <td className="px-3 py-3 text-gray-500 max-w-sm leading-relaxed">{row.boundary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-gray-600 text-xs mt-3 max-w-3xl leading-relaxed">
          Snapshot only. Figures above are the census values as measured on{' '}
          {COVERAGE_MEASURED_ON} {COVERAGE_MEASURED_TZ}. They are not rounded for comfort.
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
          Measured coverage dates for series we have in the graph are in the table above.
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
