export interface OracleResponse {
  cypher: string
  results: Record<string, unknown>[]
  summary?: string
  confidence?: number
  error?: string
}

export async function queryOracle(query: string): Promise<OracleResponse> {
  const res = await fetch('https://api.sentinelintel.org/oracle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  if (res.status === 429) {
    return { cypher: '', results: [], error: 'Rate limited. Please wait a moment.' }
  }
  if (!res.ok) {
    return { cypher: '', results: [], error: 'Oracle is temporarily unavailable.' }
  }
  return res.json()
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch('https://api.sentinelintel.org/swarm/health')
    return res.ok
  } catch {
    return false
  }
}
