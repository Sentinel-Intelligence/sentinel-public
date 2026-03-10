'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { queryOracle, OracleResponse } from '@/lib/oracle'
import CypherHighlight from '@/components/shared/CypherHighlight'
import ResultCard from '@/components/shared/ResultCard'

const PRESET_QUERIES = [
  'Who traded NVDA before the CHIPS Act?',
  'Which legislators have the highest IES scores?',
  'Show influence loops between pharma and Congress',
  'Dark money flows to Senate Banking Committee',
]

interface OracleSearchBarProps {
  /** If true, expand layout for full-page use. */
  fullPage?: boolean
  /** Pre-fill query text (auto-submit when provided). */
  initialQuery?: string
  /** Called when query submitted — used for hero redirect. */
  onQuerySubmit?: (query: string) => void
}

function LoadingSpinner() {
  return (
    <span className="inline-block w-4 h-4 border-2 border-gray-600 border-t-cyan-400 rounded-full animate-spin" />
  )
}

export default function OracleSearchBar({
  fullPage = false,
  initialQuery = '',
  onQuerySubmit,
}: OracleSearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const [result, setResult] = useState<OracleResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [showCypher, setShowCypher] = useState(false)
  const router = useRouter()

  const handleSearch = useCallback(async (q?: string) => {
    const text = (q ?? query).trim()
    if (!text) return

    if (onQuerySubmit) {
      onQuerySubmit(text)
      return
    }

    setLoading(true)
    setResult(null)
    setShowCypher(false)

    const data = await queryOracle(text)
    setResult(data)
    setLoading(false)
  }, [query, onQuerySubmit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  const handlePreset = (q: string) => {
    setQuery(q)
    handleSearch(q)
  }

  return (
    <div className={`w-full mx-auto ${fullPage ? '' : 'max-w-2xl'}`}>
      {/* Search form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ask the Oracle: Who traded NVDA before CHIPS Act?"
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200
                     placeholder-gray-600 font-mono focus:outline-none focus:border-yellow-500
                     focus:ring-1 focus:ring-yellow-500/30 transition-colors min-w-0"
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
      </form>

      {/* Preset chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        {PRESET_QUERIES.map(q => (
          <button
            key={q}
            onClick={() => handlePreset(q)}
            disabled={loading}
            className="text-xs font-mono text-gray-400 hover:text-yellow-400 border border-gray-800
                       hover:border-yellow-700 bg-gray-900/60 rounded px-3 py-1.5 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Results area */}
      {result && !result.error && (
        <div className={`mt-5 space-y-4 ${fullPage ? '' : ''}`}>
          {/* Summary + confidence */}
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

          {/* Result cards */}
          {result.results.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-gray-500 font-mono px-1">
                {result.results.length} result{result.results.length !== 1 ? 's' : ''}
              </div>
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {result.results.map((row, i) => (
                  <ResultCard key={i} row={row} />
                ))}
              </div>
            </div>
          )}

          {/* Cypher toggle */}
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

          {/* Explore in Graph link */}
          <div className="pt-1">
            <button
              onClick={() => router.push(`/graph?q=${encodeURIComponent(query.trim())}`)}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 border border-cyan-900
                         hover:border-cyan-700 bg-cyan-950/30 rounded px-4 py-2 transition-colors"
            >
              Explore in Graph →
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {result?.error && (
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

      <p className="mt-3 text-xs text-gray-600 text-center font-mono">
        Powered by Sentinel Oracle · Natural language queries against the live knowledge graph
      </p>
    </div>
  )
}
