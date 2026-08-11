'use client'

import { FormEvent, useMemo, useState } from 'react'

type OracleResponse = {
  cypher?: string
  results?: Record<string, unknown>[]
  count?: number
  error?: string | null
  summary?: string
  rate_limit_remaining?: number
}

export default function OracleClient() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [httpError, setHttpError] = useState<string | null>(null)
  const [data, setData] = useState<OracleResponse | null>(null)

  const columns = useMemo(() => {
    const rows = data?.results
    if (!rows || rows.length === 0) return [] as string[]
    const keys = new Set<string>()
    for (const row of rows) {
      Object.keys(row || {}).forEach((k) => keys.add(k))
    }
    return Array.from(keys)
  }, [data])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q.length < 5) {
      setHttpError('Enter at least 5 characters.')
      setData(null)
      return
    }
    setLoading(true)
    setHttpError(null)
    setData(null)
    try {
      const res = await fetch('/api/v1/oracle/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })
      let body: OracleResponse | null = null
      try {
        body = (await res.json()) as OracleResponse
      } catch {
        body = null
      }
      if (!res.ok) {
        const msg =
          (body && (body.error || body.summary)) ||
          `Request failed (${res.status}). This surface is rate limited; try again later.`
        setHttpError(String(msg))
        setData(body)
        return
      }
      if (body?.error) {
        setHttpError(String(body.error))
        setData(body)
        return
      }
      setData(body)
    } catch (err) {
      setHttpError(
        err instanceof Error
          ? err.message
          : 'Network error. Limited-testing surface; no uptime claim.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-left">
          <span className="text-xs uppercase tracking-widest text-gray-500">
            Question
          </span>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            minLength={5}
            placeholder="Example: Which members of Congress traded Boeing stock?"
            className="mt-2 w-full rounded border border-cyan-900/60 bg-gray-950 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-600 focus:border-cyan-500 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={loading || query.trim().length < 5}
          className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:text-gray-400 text-gray-950 font-bold px-8 py-3 rounded transition-colors text-sm"
        >
          {loading ? 'Querying…' : 'Run query'}
        </button>
      </form>

      <div className="text-xs text-gray-500 leading-relaxed space-y-1 border border-cyan-950/80 rounded p-4">
        <p>Limited-testing surface. Requests may be rate limited.</p>
        <p>
          Results reflect ingested filings with known entity-resolution gaps.
          Not a truth claim about filers. Check the sources.
        </p>
      </div>

      {httpError && (
        <div
          className="rounded border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          {httpError}
        </div>
      )}

      {data?.cypher != null && data.cypher !== '' && (
        <div>
          <div className="text-xs uppercase tracking-widest text-cyan-500 mb-2">
            Generated query
          </div>
          <pre className="overflow-x-auto rounded border border-cyan-900/50 bg-gray-950 p-4 text-xs text-gray-300 whitespace-pre-wrap">
            {data.cypher}
          </pre>
        </div>
      )}

      {data && !data.error && Array.isArray(data.results) && (
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
            <div className="text-xs uppercase tracking-widest text-cyan-500">
              Results
            </div>
            <div className="text-sm text-gray-400">
              count: {data.count ?? data.results.length}
              {typeof data.rate_limit_remaining === 'number'
                ? ` · rate_limit_remaining: ${data.rate_limit_remaining}`
                : null}
            </div>
          </div>
          {data.results.length === 0 ? (
            <p className="text-sm text-gray-500">No rows returned.</p>
          ) : (
            <div className="overflow-x-auto rounded border border-cyan-900/50">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-900/80 text-xs uppercase tracking-wider text-gray-400">
                  <tr>
                    {columns.map((col) => (
                      <th key={col} className="px-3 py-2 font-medium">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.results.map((row, i) => (
                    <tr
                      key={i}
                      className="border-t border-cyan-950/80 text-gray-300"
                    >
                      {columns.map((col) => (
                        <td key={col} className="px-3 py-2 align-top">
                          {formatCell(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}
