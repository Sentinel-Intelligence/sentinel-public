interface ResultCardProps {
  row: Record<string, unknown>
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '—'
  if (typeof val === 'number') {
    // Heuristic: if large and likely a currency amount
    if (Math.abs(val) > 1000) {
      return '$' + val.toLocaleString()
    }
    return val.toLocaleString()
  }
  return String(val)
}

function isLegislatorRow(row: Record<string, unknown>) {
  return 'name' in row && 'party' in row
}

function isTradeRow(row: Record<string, unknown>) {
  return 'name' in row && 'ticker' in row
}

function isCurrencyRow(row: Record<string, unknown>) {
  return 'amount' in row || 'value' in row
}

function PartyBadge({ party }: { party: string }) {
  const color =
    party?.startsWith('R') ? 'text-red-400 border-red-800 bg-red-950/40' :
    party?.startsWith('D') ? 'text-blue-400 border-blue-800 bg-blue-950/40' :
    'text-gray-400 border-gray-700 bg-gray-900'
  return (
    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${color}`}>
      {party ?? 'I'}
    </span>
  )
}

export default function ResultCard({ row }: ResultCardProps) {
  if (isLegislatorRow(row)) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-100 text-sm truncate">{String(row.name)}</div>
          {row.state != null && <div className="text-xs text-gray-500 mt-0.5">State: {String(row.state)}</div>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <PartyBadge party={String(row.party)} />
          {row.ies != null && (
            <span className="text-xs font-mono text-yellow-400">IES {formatValue(row.ies)}</span>
          )}
        </div>
      </div>
    )
  }

  if (isTradeRow(row)) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-100 text-sm truncate">{String(row.name)}</div>
          <div className="text-xs text-cyan-400 font-mono mt-0.5">{String(row.ticker)}</div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0 text-xs font-mono">
          {row.transaction_date != null && <span className="text-gray-400">{String(row.transaction_date)}</span>}
          {row.amount_low != null && (
            <span className="text-green-400">
              {formatValue(row.amount_low)}
              {row.amount_high != null ? ` – ${formatValue(row.amount_high)}` : ''}
            </span>
          )}
        </div>
      </div>
    )
  }

  if (isCurrencyRow(row)) {
    const amount = row.amount ?? row.value
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        {row.name != null && (
          <div className="flex-1 font-semibold text-gray-100 text-sm truncate">{String(row.name)}</div>
        )}
        <div className="text-green-400 font-mono font-bold text-sm shrink-0">
          {formatValue(amount)}
        </div>
      </div>
    )
  }

  // Default: key-value grid
  const entries = Object.entries(row).filter(([, v]) => v !== null && v !== undefined)
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
        {entries.map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="text-xs text-gray-500 font-mono truncate">{k}</dt>
            <dd className="text-sm text-gray-200 font-mono truncate" title={String(v)}>
              {formatValue(v)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
