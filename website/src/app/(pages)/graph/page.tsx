import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Graph Explorer | Sentinel Intelligence',
  description: 'Interactive exploration of the Sentinel knowledge graph: 33M+ entities and 73.7M+ connections across congressional stock trades, lobbying networks, dark money flows, and influence loops. Natural-language querying returns soon.',
  alternates: {
    canonical: 'https://sentinelintel.org/graph',
  },
}

export default function GraphPage() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-20 text-center">
      <div className="text-cyan-500 text-xs tracking-widest uppercase mb-4">Graph Explorer</div>
      <h1 className="text-3xl font-bold mb-4">
        The interactive explorer is <span className="text-cyan-400">offline</span> for now
      </h1>
      <p className="text-gray-400 mb-4 max-w-xl mx-auto">
        The Sentinel knowledge graph (33M+ entities, 73.7M+ connections) continues to grow
        and powers all published investigations. The natural-language query interface is
        offline while dedicated serving capacity is provisioned, and will return.
      </p>
      <p className="text-gray-500 text-sm mb-10 max-w-xl mx-auto">
        Researchers and journalists who need graph access in the meantime can reach us directly.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/investigations"
          className="inline-block bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-8 py-3 rounded transition-colors"
        >
          Read the investigations
        </Link>
        <a
          href="mailto:brian@sentinelintel.org"
          className="inline-block border border-cyan-800 hover:border-cyan-600 text-cyan-400 font-bold px-8 py-3 rounded transition-colors"
        >
          Contact us
        </a>
      </div>
    </section>
  )
}
