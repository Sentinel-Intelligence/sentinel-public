'use client'

import Link from 'next/link'
import NetworkCanvas from '@/components/home/NetworkCanvas'

/**
 * Main page, messaging-session standards (D-2026-08-06-GB-MAIN-PAGE-REBUILD).
 * Position: check-us, not look-what-we-built.
 * Claim: three defensible clauses + structural fourth sentence (H-31).
 * No unprovenanced aggregates. Retraction stated with what replaced it.
 * Internal names (SMELT, Oracle, IES, Burry, Lattice) never public.
 */

const DEFENSIBLE_CLAIM = [
  'What we show you is what we ingested.',
  'We can prove when we ingested it.',
  'We can prove we have not altered it since.',
  'We cannot prove the filer told the truth.',
]

const SHUTTERED = [
  { name: 'Sunlight Foundation', year: '2020', note: 'Dissolved' },
  { name: 'MapLight', year: '2022', note: 'Shuttered' },
  { name: 'ProPublica Represent', year: '2023', note: 'Discontinued' },
  { name: 'OpenSecrets API', year: '2025', note: 'Discontinued April 2025' },
]

export default function HomePage() {
  return (
    <section className="max-w-4xl mx-auto px-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl mt-10 mb-12">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 rounded-xl"
          style={{ backgroundImage: 'url(/hero-network.jpg)' }}
        />
        <NetworkCanvas />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/30 via-transparent to-gray-950/90 rounded-xl" />

        <div className="relative z-10 py-16 px-8 md:px-12">
          <div
            className="mb-4 text-cyan-500 text-xs tracking-widest uppercase hero-animate"
            style={{ animationDelay: '0ms' }}
          >
            Sentinel Intelligence
          </div>
          <h1
            className="text-3xl md:text-5xl font-bold leading-tight mb-6 max-w-2xl hero-animate"
            style={{ animationDelay: '100ms' }}
          >
            Here is why you can{' '}
            <span className="text-cyan-400">check us</span>
          </h1>
          <p
            className="text-lg text-gray-300 mb-6 max-w-xl hero-animate leading-relaxed"
            style={{ animationDelay: '200ms' }}
          >
            Sentinel is a public map of U.S. political finance built from federal
            filings. Journalists and staffers need a source that survives a second
            look, not a scoreboard of totals they cannot check.
          </p>
          <div className="hero-animate flex flex-wrap gap-3" style={{ animationDelay: '300ms' }}>
            <Link
              href="/methodology"
              className="inline-block bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-6 py-3 rounded transition-colors text-sm"
            >
              How verification works →
            </Link>
            <Link
              href="/investigations"
              className="inline-block border border-gray-700 hover:border-cyan-800 text-gray-200 px-6 py-3 rounded transition-colors text-sm"
            >
              Investigations
            </Link>
          </div>
        </div>
      </div>

      {/* Defensible claim, four sentences travel together (H-31) */}
      <div className="border border-cyan-900/60 bg-gray-900/80 rounded-xl p-8 mb-12">
        <div className="text-cyan-500 text-xs tracking-widest uppercase mb-4">
          The claim we will stand behind
        </div>
        <ol className="space-y-3 mb-6">
          {DEFENSIBLE_CLAIM.map((sentence, i) => (
            <li key={i} className="flex gap-3 text-gray-100 text-base md:text-lg leading-snug">
              <span className="text-cyan-600 font-mono text-sm shrink-0 mt-0.5">{i + 1}.</span>
              <span className={i === 3 ? 'text-gray-300' : ''}>{sentence}</span>
            </li>
          ))}
        </ol>
        <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
          Anchoring and hash provenance prove a record existed at a time and has
          not been altered since. They do not prove the underlying federal filing
          is accurate. That limit is part of the claim, not a footnote.
        </p>
        <div className="mt-6 pt-6 border-t border-gray-800 max-w-2xl">
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            Coverage dates vary by source. The graph is built from federal filings
            on an ingestion schedule, not in real time, and some series are months
            behind their sources. We publish what we ingested and when.
          </p>
          <Link
            href="/methodology#coverage-dates"
            className="text-cyan-500 text-sm hover:text-cyan-400 transition-colors"
          >
            Per-source coverage table →
          </Link>
        </div>
      </div>

      {/* What you can check */}
      <div className="mb-14">
        <h2 className="text-xl font-bold mb-3 text-gray-100">What a reader can check</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-2xl leading-relaxed">
          Every answer is designed to print two identifiers: a Sentinel trace and
          the primary-source transaction id where one exists. The second line lets
          a reader go to the FEC (or other agency) and cut Sentinel out of the loop.
        </p>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 font-mono text-sm text-gray-300 space-y-1 max-w-xl">
          <div>
            <span className="text-gray-500">Sentinel trace</span>{' '}
            <span className="text-cyan-400">sentinelintel.org/t/…</span>
          </div>
          <div>
            <span className="text-gray-500">FEC transaction</span>{' '}
            <span className="text-gray-200">40213…</span>
          </div>
        </div>
        <p className="text-gray-600 text-xs mt-3 max-w-xl">
          Trace pages are designed as permanent handles: when one is issued for a claim
          unit, if the underlying claim is retired, the trace is intended to resolve to
          the retraction rather than a 404.
        </p>
      </div>

      {/* Retraction with replacement */}
      <div className="border border-gray-800 rounded-xl p-8 mb-14 bg-gray-950">
        <div className="text-amber-600/90 text-xs tracking-widest uppercase mb-3">
          Retraction
        </div>
        <h2 className="text-xl font-bold mb-4 text-gray-100">
          A headline metric we retired
        </h2>
        <div className="space-y-4 text-gray-400 text-sm leading-relaxed max-w-2xl">
          <p>
            <span className="text-gray-200">What it was.</span> We published a
            capture-classifier performance figure, an AUC-ROC near 0.96 , 
            as if it measured held-out detection of influence.
          </p>
          <p>
            <span className="text-gray-200">Why it was circular.</span> The
            positive label was two input features combined with a logical AND.
            The model was recovering a definition it had been handed, grading
            its own homework, not measuring capture on unseen ground truth.
          </p>
          <p>
            <span className="text-gray-200">What replaced it.</span> That
            performance figure is retired. What we publish instead is
            source-bound: which federal filing a record came from, when it was
            ingested, and that the stored artifact has not been altered since.
            No replacement AUC is offered.
          </p>
        </div>
      </div>

      {/* What we will not claim */}
      <div className="mb-14">
        <h2 className="text-xl font-bold mb-4 text-gray-100">What we will not claim</h2>
        <ul className="space-y-2 text-sm text-gray-400 max-w-2xl">
          <li className="flex gap-2">
            <span className="text-red-500/80 shrink-0">-</span>
            <span>
              &ldquo;Blockchain-verified political data&rdquo; or any formulation that
              treats a hash anchor as proof of correctness.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500/80 shrink-0">-</span>
            <span>
              Unprovenanced graph totals (entity or edge counts without population,
              computation date, exclusions, and non-claims). Under standing rule
              those are removed, not silently corrected.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500/80 shrink-0">-</span>
            <span>
              Named sitting legislators as promotional examples. Tools that answer
              a user&apos;s question are one act; campaign-style name-dropping is another.
            </span>
          </li>
        </ul>
      </div>

      {/* Context: shuttered tools, keep factual, no scale boast */}
      <div className="border-t border-gray-800 pt-14 pb-16">
        <div className="mb-8 max-w-xl">
          <h2 className="text-2xl font-bold mb-3">
            Public integrity tools keep <span className="text-red-400">going dark</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Risk-averse readers need a source that remains checkable when others
            disappear, not a larger unverifiable map.
          </p>
        </div>
        <div className="max-w-2xl space-y-3 mb-8">
          {SHUTTERED.map((item) => (
            <div
              key={item.name}
              className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-4"
            >
              <span className="text-red-500 font-bold text-sm shrink-0">✕</span>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm text-gray-200">{item.name}</span>
                <span className="text-gray-500 text-xs ml-2">,  {item.note}</span>
              </div>
              <span className="font-mono text-xs text-gray-500 shrink-0">{item.year}</span>
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-sm max-w-xl">
          Sentinel is built by one person, from public federal data, under an MIT
          license. The work is nonpartisan and non-accusatory: connections are
          mapped; guilt is not assigned.
        </p>
      </div>
    </section>
  )
}
