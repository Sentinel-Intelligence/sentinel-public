import type { Metadata } from 'next'
import { Suspense } from 'react'
import GraphClient from './GraphClient'

export const metadata: Metadata = {
  title: 'Interactive Knowledge Graph | Sentinel Intelligence',
  description: 'Natural language queries against 463K entities and 7.3M connections. Explore congressional stock trades, lobbying networks, dark money flows, and influence loops.',
  alternates: {
    canonical: 'https://sentinelintel.org/graph',
  },
}

export default function GraphPage() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-10 pb-20">
      <div className="mb-8">
        <div className="text-yellow-500 text-xs tracking-widest uppercase mb-2 font-mono">Sentinel Oracle</div>
        <h1 className="text-3xl font-bold mb-2">Knowledge Graph Explorer</h1>
        <p className="text-gray-400 text-sm">
          Natural language queries against the live Sentinel graph.
        </p>
      </div>
      <Suspense fallback={<div className="text-gray-500 font-mono text-sm">Loading…</div>}>
        <GraphClient />
      </Suspense>
    </section>
  )
}
