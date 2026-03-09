import type { Metadata } from 'next'
import InfluenceMap from '@/components/shared/InfluenceMap'

export const metadata: Metadata = {
  title: 'Congressional Trading Investigations | Sentinel Intelligence',
  description: 'Explore Sentinel\'s key findings: The STOCK Act changed who dared to trade, not whether they traded. CHIPS Act window trades, committee conflicts, and behavioral camp analysis.',
  alternates: {
    canonical: 'https://sentinelintel.org/investigations',
  },
}

const CAMPS = [
  {
    name: 'The Quitters',
    color: 'green' as const,
    description: 'Complied immediately. No trades during sensitive windows. Represent genuine reform response.',
    members: ['Lee (NV)', 'Fallon', 'Beyer', 'Newman', 'Jacobs'],
    stats: ['Post-act activity: minimal', 'Compliance: immediate'],
  },
  {
    name: 'The Defiant',
    color: 'red' as const,
    description: 'Continued trading through enforcement windows. Bet that scrutiny would remain weak.',
    members: ['McClain', 'Cisneros', 'Greene (GA)', 'Gottheimer', 'Pelosi'],
    stats: ['Sell%: sustained elevation', 'Enforcement actions: near-zero'],
  },
  {
    name: 'The Whales',
    color: 'yellow' as const,
    description: 'Large-volume traders who shifted timing rather than stopping. Most sophisticated adaptation.',
    members: ['Biggs ($10.9M)', 'Hern ($10.5M)', 'Pelosi ($1.5M)'],
    stats: ['CHIPS Act window: 18 trades', 'Semiconductor sector focus'],
  },
]

const CAMP_COLORS = {
  green:  { border: 'border-green-500',  text: 'text-green-400',  tag: 'bg-green-900/30 text-green-300 border-green-800' },
  red:    { border: 'border-red-500',    text: 'text-red-400',    tag: 'bg-red-900/30 text-red-300 border-red-800' },
  yellow: { border: 'border-yellow-500', text: 'text-yellow-400', tag: 'bg-yellow-900/30 text-yellow-300 border-yellow-800' },
}

const SELL_TIMELINE = [
  { quarter: "Q3 '23", value: 62.1, note: 'peak reform pressure',    style: { bar: 'bg-red-500',    label: 'text-red-400',    badge: 'bg-red-900/40 text-red-300 border-red-700' } },
  { quarter: "Q4 '24", value: 12.4, note: 'ban dies — buying frenzy', style: { bar: 'bg-green-500',  label: 'text-green-400',  badge: 'bg-green-900/40 text-green-300 border-green-700' } },
  { quarter: "Q2 '25", value: 45.7, note: 'back to normal',           style: { bar: 'bg-yellow-500', label: 'text-yellow-400', badge: 'bg-yellow-900/40 text-yellow-300 border-yellow-700' } },
]

const CHIPS_TRADES = [
  { legislator: 'Pelosi',  action: 'BUY',  ticker: 'NVDA',       size: '$1–5M',    date: 'Jun 17', note: 'Pre-markup' },
  { legislator: 'Pelosi',  action: 'SELL', ticker: 'NVDA',       size: '$1–5M',    date: 'Jul 26', note: '39 days later' },
  { legislator: 'Manning', action: 'BUY',  ticker: 'Chips/SOXX', size: 'multiple', date: 'Jun–Jul', note: '8 purchases' },
]

const CONFLICTS = [
  { legislator: 'Gottheimer', trades: 'Visa, Mastercard',     committee: 'Financial Services' },
  { legislator: 'Cisneros',   trades: 'Boeing, Raytheon',     committee: 'Armed Services'     },
  { legislator: 'McClain',    trades: 'Humana, UnitedHealth', committee: 'Energy & Health'    },
]

function Camp({ name, color, description, members, stats }: typeof CAMPS[number]) {
  const c = CAMP_COLORS[color]
  return (
    <div className={`bg-gray-900 border-l-4 ${c.border} rounded-r-lg p-6`}>
      <div className={`font-bold text-lg mb-2 ${c.text}`}>{name}</div>
      <p className="text-gray-300 text-sm mb-3">{description}</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {members.map(m => (
          <span key={m} className={`text-xs px-2 py-0.5 rounded border ${c.tag}`}>{m}</span>
        ))}
      </div>
      {stats.map((s, i) => (
        <div key={i} className="text-xs text-gray-500">{s}</div>
      ))}
    </div>
  )
}

export default function InvestigationsPage() {
  const maxVal = 70
  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-cyan-500 text-xs tracking-widest uppercase mb-4">Key Findings</div>
      <h1 className="text-3xl font-bold mb-10">
        The STOCK Act did not stop trading. It changed who dared.
      </h1>

      {/* Three Camps */}
      <h2 className="text-xl font-semibold text-cyan-300 mb-6">The Three Camps</h2>
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {CAMPS.map(camp => <Camp key={camp.name} {...camp} />)}
      </div>

      {/* Sell% Timeline */}
      <h2 className="text-xl font-semibold text-cyan-300 mb-4">Sell% Timeline</h2>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
        <h4 className="text-gray-400 text-xs tracking-widest uppercase mb-6">
          Congressional Sell% — Key Inflection Quarters
        </h4>
        <div className="flex items-end gap-8 mb-4" style={{ height: '120px' }}>
          {SELL_TIMELINE.map(({ quarter, value, style }) => (
            <div key={quarter} className="flex-1 flex flex-col items-center gap-1">
              <span className={`text-sm font-bold tabular-nums ${style.label}`}>{value}%</span>
              <div className="w-full flex items-end" style={{ height: '90px' }}>
                <div className={`w-full rounded-t ${style.bar}`} style={{ height: `${(value / maxVal) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-8">
          {SELL_TIMELINE.map(({ quarter, note, style }) => (
            <div key={quarter} className="flex-1 text-center">
              <div className="text-xs text-gray-300 font-semibold mb-1">{quarter}</div>
              <span className={`text-xs px-2 py-0.5 rounded border ${style.badge}`}>{note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CHIPS Act Window */}
      <h2 className="text-xl font-semibold text-cyan-300 mb-4">CHIPS Act Trading Window</h2>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h4 className="text-cyan-400 font-bold">CHIPS Act Window — 18 Semiconductor Trades</h4>
          <span className="text-xs text-gray-500 border border-gray-700 px-2 py-0.5 rounded">
            Jun–Jul 2022 · markup period
          </span>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          While the CHIPS and Science Act was being marked up in committee, members with direct
          jurisdiction made concentrated semiconductor sector trades. Both parties involved.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-800">
                <th className="text-left py-2 pr-4">Legislator</th>
                <th className="text-left py-2 pr-4">Action</th>
                <th className="text-left py-2 pr-4">Asset</th>
                <th className="text-left py-2 pr-4">Size</th>
                <th className="text-left py-2 pr-4">Date</th>
                <th className="text-left py-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {CHIPS_TRADES.map((t, i) => (
                <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-2 pr-4 font-semibold text-gray-200">{t.legislator}</td>
                  <td className="py-2 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                      t.action === 'BUY' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'
                    }`}>
                      {t.action}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-cyan-400">{t.ticker}</td>
                  <td className="py-2 pr-4 text-gray-300">{t.size}</td>
                  <td className="py-2 pr-4 text-gray-400">{t.date}</td>
                  <td className="py-2 text-gray-500 text-xs">{t.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-gray-600">
          Total: 18 trades across semiconductor sector · Source: House PTR disclosures
        </div>
      </div>

      {/* Committee Conflicts */}
      <h2 className="text-xl font-semibold text-cyan-300 mb-4">2025 Committee Conflicts</h2>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-16">
        <h4 className="text-cyan-400 font-bold mb-3">2025 Committee Conflicts</h4>
        <p className="text-gray-400 text-sm mb-4">
          Reform pressure worked temporarily — the ban&apos;s failure emboldened continued trading
          with direct committee jurisdiction conflicts into 2025.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-800">
                <th className="text-left py-2 pr-6">Legislator</th>
                <th className="text-left py-2 pr-6">Holdings / Trades</th>
                <th className="text-left py-2">Committee</th>
              </tr>
            </thead>
            <tbody>
              {CONFLICTS.map((c, i) => (
                <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-2 pr-6 font-semibold text-gray-200">{c.legislator}</td>
                  <td className="py-2 pr-6 text-yellow-400">{c.trades}</td>
                  <td className="py-2 text-gray-300">{c.committee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Influence Map */}
      <div className="text-cyan-500 text-xs tracking-widest uppercase mb-4">Influence Map</div>
      <h2 className="text-3xl font-bold mb-3">Watch influence flow through Congress</h2>
      <p className="text-gray-400 text-sm mb-10 max-w-2xl">
        Every node is a legislator. Size reflects their Influence Exposure Score.
        Edges appear when two members traded the same stock in the same month.
        Pulse rings fire when trades occur — green for buys, red for sells.
        Use the control bar to play, adjust speed, or reset.
      </p>
      <InfluenceMap />
      <div className="mt-6 grid sm:grid-cols-3 gap-4 text-xs text-gray-600 font-mono">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-gray-400 font-semibold mb-1">Node size</div>
          <p>IES score — larger = more deeply embedded in influence networks</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-gray-400 font-semibold mb-1">Red heat glow</div>
          <p>IES ≥ 20 — node&apos;s sphere of influence extends well beyond direct donations</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-gray-400 font-semibold mb-1">Cyan edges</div>
          <p>Two legislators traded shares of the same company in the same calendar month</p>
        </div>
      </div>
    </section>
  )
}
