import type { Metadata } from 'next'
import OracleSearchBar from '@/components/home/OracleSearchBar'

export const metadata: Metadata = {
  title: 'API Documentation & Pricing | Sentinel Intelligence',
  description: 'Programmatic access to the Sentinel knowledge graph. Free tier available. Reporter ($49/mo), Newsroom ($299/mo), and Institution ($999/mo) plans. Base URL: api.sentinelintel.org.',
  alternates: {
    canonical: 'https://sentinelintel.org/api-docs',
  },
}

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/v1/stats',
    tier: 'FREE',
    desc: 'Graph statistics — node/edge counts, IES summary, trade totals.',
    example: '{"graph":{"nodes":463670,"edges":7338730},"legislators":{"scored":1228,"avg_ies":16.56},"trades":{"total":16238}}',
  },
  {
    method: 'GET',
    path: '/api/v1/legislators/{bioguide}/trades',
    tier: 'REPORTER',
    desc: 'Stock trade history for a legislator by bioguide ID.',
    example: null,
  },
  {
    method: 'GET',
    path: '/api/v1/legislators/{bioguide}/donations',
    tier: 'REPORTER',
    desc: 'Campaign contribution donors for a legislator.',
    example: null,
  },
  {
    method: 'GET',
    path: '/api/v1/legislators/{bioguide}/conflicts',
    tier: 'REPORTER',
    desc: 'Committee jurisdiction conflicts with trading activity.',
    example: null,
  },
  {
    method: 'GET',
    path: '/api/v1/legislators/{bioguide}/archetype',
    tier: 'REPORTER',
    desc: 'Behavioral archetype classification (Quitter / Defiant / Whale).',
    example: null,
  },
  {
    method: 'GET',
    path: '/api/v1/legislators/{bioguide}/network',
    tier: 'NEWSROOM',
    desc: 'Full influence network — 2-hop donor/lobbying graph.',
    example: null,
  },
  {
    method: 'GET',
    path: '/api/v1/legislators/{bioguide}/dossier',
    tier: 'NEWSROOM',
    desc: 'Comprehensive dossier: trades, donations, conflicts, network summary.',
    example: null,
  },
  {
    method: 'POST',
    path: '/oracle',
    tier: 'FREE',
    desc: 'Natural language query against the knowledge graph via Sentinel Oracle.',
    example: '{"query":"Who traded NVDA before the CHIPS Act?"}',
  },
]

const TIER_COLORS: Record<string, string> = {
  FREE:        'bg-green-900/30 text-green-300 border-green-800',
  REPORTER:    'bg-blue-900/30 text-blue-300 border-blue-800',
  NEWSROOM:    'bg-purple-900/30 text-purple-300 border-purple-800',
  INSTITUTION: 'bg-orange-900/30 text-orange-300 border-orange-800',
}

const METHOD_COLORS: Record<string, string> = {
  GET:  'bg-cyan-900/40 text-cyan-400',
  POST: 'bg-yellow-900/40 text-yellow-400',
}

const TIERS = [
  { name: 'FREE',        price: '$0',    limit: '100 req/day',   note: 'IP-based, no key required' },
  { name: 'REPORTER',    price: '$49/mo', limit: '5,000 req/day',  note: 'Ideal for individual journalists' },
  { name: 'NEWSROOM',    price: '$299/mo',limit: '50,000 req/day', note: 'Teams and newsrooms' },
  { name: 'INSTITUTION', price: '$999/mo',limit: '500,000 req/day',note: 'Research institutions, large publishers' },
]

export default function ApiDocsPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-cyan-500 text-xs tracking-widest uppercase mb-4">API Reference</div>
      <h1 className="text-3xl font-bold mb-3">Sentinel Intelligence API</h1>
      <p className="text-gray-400 mb-10 max-w-2xl text-sm">
        Programmatic access to the Sentinel knowledge graph. Base URL:{' '}
        <code className="text-cyan-400 bg-gray-900 px-2 py-0.5 rounded text-xs">https://api.sentinelintel.org</code>
      </p>

      {/* Oracle live demo */}
      <div className="bg-gray-900 border border-cyan-800/50 rounded-xl p-6 mb-12">
        <div className="text-cyan-500 text-xs tracking-widest uppercase mb-3">Live Demo — Oracle NLQ</div>
        <h2 className="text-xl font-bold mb-4">Try it now</h2>
        <OracleSearchBar />
      </div>

      {/* Tiers */}
      <h2 className="text-xl font-semibold text-cyan-300 mb-4">Access Tiers</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
        {TIERS.map(t => (
          <div key={t.name} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className={`inline-block text-xs px-2 py-0.5 rounded border mb-2 ${TIER_COLORS[t.name]}`}>{t.name}</div>
            <div className="text-xl font-bold text-gray-100 mb-0.5">{t.price}</div>
            <div className="text-cyan-400 font-mono text-xs mb-1">{t.limit}</div>
            <div className="text-gray-500 text-xs">{t.note}</div>
          </div>
        ))}
      </div>

      {/* Authentication */}
      <h2 className="text-xl font-semibold text-cyan-300 mb-4">Authentication</h2>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 mb-12 font-mono text-sm">
        <div className="text-gray-400 mb-2 text-xs uppercase tracking-widest">Request header</div>
        <code className="text-cyan-400">X-API-Key: your_api_key_here</code>
        <p className="text-gray-500 text-xs mt-3">
          Free tier uses IP-based rate limiting — no key required. Pass your key to identify your account and unlock higher limits.
          Response headers include <span className="text-gray-400">X-Sentinel-Tier</span> and <span className="text-gray-400">X-RateLimit-Remaining</span>.
        </p>
      </div>

      {/* Endpoints */}
      <h2 className="text-xl font-semibold text-cyan-300 mb-4">Endpoints</h2>
      <div className="space-y-3 mb-12">
        {ENDPOINTS.map((ep, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${METHOD_COLORS[ep.method] || 'bg-gray-700 text-gray-300'}`}>
                {ep.method}
              </span>
              <code className="text-gray-200 font-mono text-sm">{ep.path}</code>
              <span className={`text-xs px-2 py-0.5 rounded border ${TIER_COLORS[ep.tier]}`}>{ep.tier}</span>
            </div>
            <p className="text-gray-400 text-sm mb-2">{ep.desc}</p>
            {ep.example && (
              <pre className="text-xs text-gray-500 bg-gray-950 rounded p-3 overflow-x-auto border border-gray-800">
                {ep.example}
              </pre>
            )}
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
        <div className="text-cyan-400 font-bold mb-2">Need higher limits or custom access?</div>
        <p className="text-gray-400 text-sm mb-4">Contact us for institutional pricing, bulk data exports, or research partnerships.</p>
        <a
          href="mailto:api@sentinelintel.org"
          className="inline-block bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold px-6 py-2 rounded transition-colors text-sm"
        >
          Contact API Team
        </a>
      </div>
    </section>
  )
}
