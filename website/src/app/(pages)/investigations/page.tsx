import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Investigations | Sentinel Intelligence',
  description:
    'How Sentinel frames public-record investigations: primary sources first, no named-legislator promotion, no unprovenanced scoreboards.',
  alternates: {
    canonical: 'https://sentinelintel.org/investigations',
  },
}

/**
 * Investigations - D-2026-08-06-GB-PAGE-AUDIT.
 * Prior page promoted named sitting legislators, internal scoring ranks, and
 * unprovenanced sell%/dollar figures. Removed under messaging standards.
 */
export default function InvestigationsPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-cyan-500 text-xs tracking-widest uppercase mb-4">Investigations</div>
      <h1 className="text-3xl font-bold mb-6">
        Public records first. Names and scoreboards only when a reader asked for them.
      </h1>
      <p className="text-gray-400 text-sm leading-relaxed max-w-2xl mb-10">
        This page does not publish named sitting legislators as promotional examples,
        and it does not publish undated sell percentages, dollar totals, or influence
        scores. Those patterns were retired from this surface under the site claim
        standard. What remains is how a check-us investigation is supposed to work.
      </p>

      <div className="border border-cyan-900/60 bg-gray-900/80 rounded-xl p-8 mb-12">
        <div className="text-cyan-500 text-xs tracking-widest uppercase mb-4">
          The claim that applies here
        </div>
        <ol className="space-y-3 text-gray-100 text-base leading-snug mb-4">
          <li className="flex gap-3">
            <span className="text-cyan-600 font-mono text-sm shrink-0">1.</span>
            <span>What we show you is what we ingested.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-cyan-600 font-mono text-sm shrink-0">2.</span>
            <span>We can prove when we ingested it.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-cyan-600 font-mono text-sm shrink-0">3.</span>
            <span>We can prove we have not altered it since.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-cyan-600 font-mono text-sm shrink-0">4.</span>
            <span className="text-gray-300">We cannot prove the filer told the truth.</span>
          </li>
        </ol>
        <p className="text-gray-500 text-sm leading-relaxed">
          If a write-up cannot carry those four sentences, it does not ship.
        </p>
      </div>

      <h2 className="text-xl font-bold mb-4 text-gray-100">What a public write-up must print</h2>
      <ul className="space-y-3 text-sm text-gray-400 max-w-2xl mb-12">
        <li className="flex gap-2">
          <span className="text-cyan-600 shrink-0">1.</span>
          <span>
            A Sentinel trace handle for the claim unit, when one exists.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="text-cyan-600 shrink-0">2.</span>
          <span>
            The primary-source transaction or disclosure identifier (for example an FEC
            transaction id or a House PTR filing reference) so a reader can cut Sentinel
            out of the loop.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="text-cyan-600 shrink-0">3.</span>
          <span>
            For any figure: population definition, computation date, exclusions, and
            non-claims. Undated aggregates are removed, not silently corrected.
          </span>
        </li>
      </ul>

      <h2 className="text-xl font-bold mb-4 text-gray-100">What we will not put on this page</h2>
      <ul className="space-y-2 text-sm text-gray-400 max-w-2xl mb-12">
        <li className="flex gap-2">
          <span className="text-red-500/80 shrink-0">-</span>
          <span>Named sitting legislators as campaign-style examples.</span>
        </li>
        <li className="flex gap-2">
          <span className="text-red-500/80 shrink-0">-</span>
          <span>
            Influence scores, classifier performance figures, or other accuracy metrics as
            paper of record (including the retired capture-classifier AUC family).
          </span>
        </li>
        <li className="flex gap-2">
          <span className="text-red-500/80 shrink-0">-</span>
          <span>
            Interactive maps that rank people by unprovenanced &ldquo;influence&rdquo; scores.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="text-red-500/80 shrink-0">-</span>
          <span>Coming-soon research drops or undated scoreboard timelines.</span>
        </li>
      </ul>

      <div className="border border-gray-800 rounded-xl p-8 bg-gray-950 mb-10">
        <div className="text-amber-600/90 text-xs tracking-widest uppercase mb-3">
          Retraction of prior surface content
        </div>
        <p className="text-gray-400 text-sm leading-relaxed max-w-2xl mb-3">
          Earlier versions of this page listed named members, dollar windows, and sell
          percentages without the measurement boundary required by the site claim. That
          content is withdrawn. Replacement is this standard, not a new scoreboard.
        </p>
        <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">
          Future case write-ups land here only when every figure is provenanced and every
          person named appears because a reader query or a primary-source citation requires
          it, not as decoration.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/methodology"
          className="inline-block bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-6 py-3 rounded transition-colors text-sm"
        >
          How verification works
        </Link>
        <Link
          href="/"
          className="inline-block border border-gray-700 hover:border-cyan-800 text-gray-200 px-6 py-3 rounded transition-colors text-sm"
        >
          Site claim
        </Link>
      </div>
    </section>
  )
}
