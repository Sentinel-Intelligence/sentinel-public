'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import NetworkCanvas from '@/components/home/NetworkCanvas'
import { AnimatedStat } from '@/components/shared/AnimatedCounter'
import OracleSearchBar from '@/components/home/OracleSearchBar'

const SHUTTERED = [
  { name: 'Sunlight Foundation',   year: '2020', note: 'Dissolved' },
  { name: 'MapLight',              year: '2022', note: 'Shuttered' },
  { name: 'ProPublica Represent',  year: '2023', note: 'Discontinued' },
  { name: 'OpenSecrets API',       year: '2025', note: 'Discontinued April 2025' },
]

// IC2S2 frozen stats
const GRAPH_STATS = { nodes: 463670, edges: 7338730, trades: 16238 }

export default function HomePage() {
  const router = useRouter()

  const handleOracleSubmit = (q: string) => {
    router.push(`/graph?q=${encodeURIComponent(q)}`)
  }

  return (
    <section className="max-w-4xl mx-auto px-6">

      {/* Hero — with animated network background */}
      <div className="relative overflow-hidden rounded-xl mt-10 mb-12">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 rounded-xl"
          style={{ backgroundImage: 'url(/hero-network.jpg)' }}
        />
        <NetworkCanvas />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/20 via-transparent to-gray-950/80 rounded-xl" />

        <div className="relative z-10 py-20 px-8 md:px-12">
          <div className="mb-4 text-cyan-500 text-xs tracking-widest uppercase hero-animate" style={{ animationDelay: '0ms' }}>
            The Sentinel Project
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 max-w-2xl hero-animate" style={{ animationDelay: '100ms' }}>
            The largest open graph of{' '}
            <span className="text-cyan-400">congressional influence</span>{' '}
            ever built
          </h1>
          <p className="text-lg text-gray-300 mb-4 max-w-xl hero-animate" style={{ animationDelay: '200ms' }}>
            463K entities. 7.3M connections. Every dollar traced.
          </p>
          <p className="text-gray-400 max-w-xl leading-relaxed text-sm hero-animate" style={{ animationDelay: '300ms' }}>
            Sentinel maps the full network of political finance — campaign donors, federal
            contractors, lobbyists, legislators, and dark money flows — into a unified knowledge
            graph. Machine learning models trained on this graph detect influence patterns
            invisible to manual review.
          </p>
          <div className="hero-animate" style={{ animationDelay: '400ms' }}>
            <Link
              href="/investigations"
              className="inline-block mt-6 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-8 py-3 rounded transition-colors"
            >
              Explore the Graph →
            </Link>
          </div>
        </div>
      </div>

      {/* Animated stat counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <AnimatedStat target={GRAPH_STATS.nodes}  label="Entities Mapped" />
        <AnimatedStat target={GRAPH_STATS.edges}  label="Graph Edges" />
        <AnimatedStat target={GRAPH_STATS.trades} label="Stock Trades Analyzed" />
      </div>

      {/* Oracle search */}
      <div className="mb-16">
        <div className="text-center mb-6">
          <div className="text-cyan-500 text-xs tracking-widest uppercase mb-2">Sentinel Oracle</div>
          <h2 className="text-2xl font-bold mb-2">Ask the knowledge graph anything</h2>
          <p className="text-gray-400 text-sm">Natural language queries against 463K entities and 7.3M edges</p>
        </div>
        <OracleSearchBar onQuerySubmit={handleOracleSubmit} />
      </div>

      {/* Problem: shuttered tools */}
      <div className="border-t border-gray-800 pt-16 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-3">
            The tools are <span className="text-red-400">disappearing</span>
          </h2>
          <p className="text-gray-400 text-sm max-w-lg mx-auto">
            One by one, the platforms that made government data accessible have gone dark.
          </p>
        </div>
        <div className="max-w-2xl mx-auto space-y-3 mb-10">
          {SHUTTERED.map(item => (
            <div key={item.name} className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-4">
              <span className="text-red-500 font-bold text-sm shrink-0">✕</span>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm text-gray-200">{item.name}</span>
                <span className="text-gray-500 text-xs ml-2">— {item.note}</span>
              </div>
              <span className="font-mono text-xs text-gray-500 shrink-0">{item.year}</span>
            </div>
          ))}
        </div>
        <div className="text-center">
          <div className="inline-flex items-center gap-3 bg-gray-900 border border-cyan-800 rounded-lg px-8 py-4">
            <span className="text-cyan-400 font-bold">→</span>
            <span className="font-semibold text-cyan-300">Sentinel fills the gap</span>
          </div>
        </div>
      </div>
    </section>
  )
}
