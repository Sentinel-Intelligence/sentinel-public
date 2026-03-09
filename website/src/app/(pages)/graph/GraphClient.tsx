'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { queryOracle, OracleResponse } from '@/lib/oracle'
import CypherHighlight from '@/components/shared/CypherHighlight'
import ResultCard from '@/components/shared/ResultCard'

const PRESET_QUERIES = [
  'Who traded NVDA before the CHIPS Act?',
  'Which legislators have the highest IES scores?',
  'Show influence loops between pharma and Congress',
  'Dark money flows to Senate Banking Committee',
]

const MAX_HISTORY = 5

function LoadingSpinner() {
  return (
    <span className="inline-block w-4 h-4 border-2 border-gray-600 border-t-cyan-400 rounded-full animate-spin" />
  )
}

export default function GraphClient() {
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''

  const [query, setQuery] = useState(initialQ)
  const [result, setResult] = useState<OracleResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [showCypher, setShowCypher] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const didAutoSubmit = useRef(false)

  const runQuery = async (q: string) => {
    const text = q.trim()
    if (!text) return

    setLoading(true)
    setResult(null)
    setShowCypher(false)

    // Update URL without navigation
    const newUrl = `/graph?q=${encodeURIComponent(text)}`
    window.history.replaceState(null, '', newUrl)

    setHistory(prev => {
      const next = [text, ...prev.filter(h => h !== text)].slice(0, MAX_HISTORY)
      return next
    })

    const data = await queryOracle(text)
    setResult(data)
    setLoading(false)
  }

  // Auto-submit if ?q= is present
  useEffect(() => {
    if (initialQ && !didAutoSubmit.current) {
      didAutoSubmit.current = true
      runQuery(initialQ)
    }
  }, [initialQ]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    runQuery(query)
  }

  const shareQuery = () => {
    const url = `${window.location.origin}/graph?q=${encodeURIComponent(query.trim())}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-80px)]">
      {/* Sidebar: history */}
      <aside className="w-full lg:w-56 shrink-0">
        <div className="lg:sticky lg:top-24">
          <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">Recent</div>
          {history.length === 0 ? (
            <div className="text-xs text-gray-600 font-mono">No queries yet</div>
          ) : (
            <ul className="space-y-1">
              {history.map((h, i) => (
                <li key={i}>
                  <button
                    onClick={() => { setQuery(h); runQuery(h) }}
                    className="w-full text-left text-xs font-mono text-gray-400 hover:text-yellow-400
                               transition-colors py-1.5 px-2 rounded hover:bg-gray-900 truncate"
                    title={h}
                  >
                    {h}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">Suggested</div>
          <ul className="space-y-1">
            {PRESET_QUERIES.map(q => (
              <li key={q}>
                <button
                  onClick={() => { setQuery(q); runQuery(q) }}
                  className="w-full text-left text-xs font-mono text-gray-500 hover:text-yellow-400
                             transition-colors py-1.5 px-2 rounded hover:bg-gray-900 truncate"
                  title={q}
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Search bar */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask the Oracle: Who traded NVDA before CHIPS Act?"
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm
                       text-gray-200 placeholder-gray-600 font-mono focus:outline-none
                       focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/30
                       transition-colors min-w-0"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed
                       text-gray-950 font-bold px-5 py-3 rounded-lg transition-colors text-sm shrink-0
                       flex items-center gap-2"
          >
            {loading ? <LoadingSpinner /> : null}
            {loading ? 'Querying' : 'Ask'}
          </button>
          {query.trim() && (
            <button
              type="button"
              onClick={shareQuery}
              className="text-xs font-mono px-4 py-3 rounded-lg border border-gray-700
                         text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors shrink-0"
            >
              {copied ? 'Copied!' : 'Share'}
            </button>
          )}
        </form>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center gap-3 text-sm text-gray-400 font-mono py-8">
            <LoadingSpinner /> Querying the knowledge graph…
          </div>
        )}

        {/* Results */}
        {result && !result.error && !loading && (
          <div className="space-y-4">
            {result.summary && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-1 text-sm text-gray-200 leading-relaxed">{result.summary}</div>
                {result.confidence !== undefined && (
                  <span className={`shrink-0 text-xs font-mono px-2 py-1 rounded border ${
                    result.confidence >= 0.8
                      ? 'text-green-400 border-green-800 bg-green-950/40'
                      : result.confidence >= 0.5
                      ? 'text-yellow-400 border-yellow-800 bg-yellow-950/40'
                      : 'text-red-400 border-red-800 bg-red-950/40'
                  }`}>
                    {Math.round(result.confidence * 100)}% confidence
                  </span>
                )}
              </div>
            )}

            {result.results.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-gray-500 font-mono px-1">
                  {result.results.length} result{result.results.length !== 1 ? 's' : ''}
                </div>
                <div className="space-y-2">
                  {result.results.map((row, i) => (
                    <ResultCard key={i} row={row} />
                  ))}
                </div>
              </div>
            )}

            {result.cypher && (
              <div>
                <button
                  onClick={() => setShowCypher(v => !v)}
                  className="text-xs font-mono text-gray-500 hover:text-yellow-400 transition-colors mb-2"
                >
                  {showCypher ? '▾ Hide Cypher' : '▸ Show Cypher'}
                </button>
                {showCypher && <CypherHighlight code={result.cypher} />}
              </div>
            )}
          </div>
        )}

        {/* Error state */}
        {result?.error && !loading && (
          <div className="mt-4 bg-red-950/30 border border-red-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-red-400 text-sm flex-1">{result.error}</span>
            <a
              href="https://api.sentinelintel.org/swarm/health"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-gray-400 hover:text-gray-200 underline shrink-0"
            >
              Check health →
            </a>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <div className="py-16 text-center">
            <div className="text-gray-600 font-mono text-sm mb-2">Oracle ready</div>
            <div className="text-xs text-gray-700 font-mono">
              463K entities · 7.3M edges · natural language queries
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
