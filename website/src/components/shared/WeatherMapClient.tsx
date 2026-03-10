'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const PARTY_COLOR: Record<string, string> = { D: '#3b82f6', R: '#ef4444', I: '#eab308' }
const PULSE_BUY  = '34,197,94'
const PULSE_SELL = '239,68,68'
const PULSE_EXCH = '234,179,8'

interface Legislator {
  name:  string
  party: string
  ies:   number
}

interface Trade {
  legislator: string
  party:      string
  ies:        number
  company:    string
  date:       string
  type:       string
  amount_low?: number
}

interface RawData {
  legislators: Legislator[]
  trades:      Trade[]
  donations:   unknown[]
  byMonth:     Record<string, Trade[]>
}

interface Node extends Legislator {
  x: number
  y: number
}

interface Pulse {
  x: number; y: number; maxR: number; r: number; col: string; born: number
}

function iesRadius(ies: number) {
  return Math.max(4, Math.min(15, 4 + (ies || 2) / 42 * 11))
}

function iesTier(ies: number) {
  if (!ies || ies < 10) return 'low'
  if (ies < 20)         return 'elevated'
  if (ies < 30)         return 'high'
  return 'critical'
}

function forceLayout(nodes: Node[], iters = 140): Node[] {
  const ns  = nodes.map(n => ({ ...n }))
  const pad = 0.07
  const MIN = 0.09
  for (let it = 0; it < iters; it++) {
    for (let i = 0; i < ns.length; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        const dx   = ns[i].x - ns[j].x
        const dy   = ns[i].y - ns[j].y
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001
        if (dist < MIN) {
          const f = (MIN - dist) / dist * 0.5
          ns[i].x += dx * f;  ns[j].x -= dx * f
          ns[i].y += dy * f;  ns[j].y -= dy * f
        }
      }
    }
    for (const n of ns) {
      n.x += (0.5 - n.x) * 0.012
      n.y += (0.5 - n.y) * 0.012
      n.x  = Math.max(pad, Math.min(1 - pad, n.x))
      n.y  = Math.max(pad, Math.min(1 - pad, n.y))
    }
  }
  return ns
}

function fallbackData() {
  const legislators: Legislator[] = [
    { name: 'Pelosi',     party: 'D', ies: 28.4 },
    { name: 'Biggs',      party: 'R', ies: 22.1 },
    { name: 'Gottheimer', party: 'D', ies: 18.9 },
    { name: 'McClain',    party: 'R', ies: 15.2 },
    { name: 'Hern',       party: 'R', ies: 24.8 },
    { name: 'Cisneros',   party: 'D', ies: 12.4 },
  ]
  const months  = ['2024-01','2024-02','2024-03','2024-04','2024-05','2024-06']
  const trades: Trade[]  = []
  const byMonth: Record<string, Trade[]> = {}
  for (const m of months) {
    byMonth[m] = []
    for (const l of legislators) {
      if (Math.random() > 0.55) {
        const t: Trade = { legislator: l.name, party: l.party, ies: l.ies,
                           company: 'Demo Corp', date: `${m}-15`,
                           type: Math.random() > 0.5 ? 'purchase' : 'sale_full', amount_low: 10000 }
        trades.push(t)
        byMonth[m].push(t)
      }
    }
  }
  return { rawData: { legislators, trades, donations: [], byMonth }, months }
}

export default function WeatherMapClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef  = useRef<{ nodes: Node[]; months: string[]; monthIdx: number; rawData: RawData | null; hovered: string | null }>({
    nodes: [], months: [], monthIdx: 0, rawData: null, hovered: null,
  })

  const [rawData,   setRawData]   = useState<RawData | null>(null)
  const [months,    setMonths]    = useState<string[]>([])
  const [monthIdx,  setMonthIdx]  = useState(0)
  const [playing,   setPlaying]   = useState(false)
  const [partyFilt, setPartyFilt] = useState('all')
  const [tierFilt,  setTierFilt]  = useState('all')
  const [hovered,   setHovered]   = useState<string | null>(null)
  const [nodes,     setNodes]     = useState<Node[]>([])
  const [speed,     setSpeed]     = useState(1)

  useEffect(() => {
    fetch('/weather_data.json')
      .then(r => r.json())
      .then(raw => {
        const legMap = new Map<string, Legislator>()
        for (const t of raw.trades || []) {
          if (!legMap.has(t.legislator))
            legMap.set(t.legislator, { name: t.legislator, party: t.party || '', ies: t.ies || 0 })
        }
        const monthSet = new Set<string>()
        const byMonth: Record<string, Trade[]> = {}
        for (const t of raw.trades || []) {
          if (!t.date) continue
          const m = t.date.slice(0, 7)
          monthSet.add(m)
          ;(byMonth[m] = byMonth[m] || []).push(t)
        }
        setRawData({ legislators: Array.from(legMap.values()), trades: raw.trades || [], donations: raw.donations || [], byMonth })
        setMonths(Array.from(monthSet).sort())
      })
      .catch(() => {
        const fb = fallbackData()
        setRawData(fb.rawData)
        setMonths(fb.months)
      })
  }, [])

  useEffect(() => {
    if (!rawData) return
    const legs = rawData.legislators.filter(l => {
      if (partyFilt !== 'all' && l.party !== partyFilt) return false
      if (tierFilt  !== 'all' && iesTier(l.ies) !== tierFilt) return false
      return true
    })
    const seed: Node[] = legs.map(l => {
      const h = l.name.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xfffff, 0)
      return {
        ...l,
        x: 0.5 + Math.cos((h % 1000) / 1000 * Math.PI * 2) * (0.25 + (h % 400) / 1000 * 0.3),
        y: 0.5 + Math.sin((h % 1000) / 1000 * Math.PI * 2) * (0.25 + (h % 400) / 1000 * 0.3),
      }
    })
    setNodes(forceLayout(seed))
  }, [rawData, partyFilt, tierFilt])

  useEffect(() => {
    stateRef.current = { nodes, months, monthIdx, rawData, hovered }
  }, [nodes, months, monthIdx, rawData, hovered])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !rawData || nodes.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width  = canvas.offsetWidth  * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const pulses: Pulse[] = []
    let lastMi = -1
    let animId: number

    const draw = () => {
      const { nodes: ns, months: ms, monthIdx: mi, rawData: d } = stateRef.current
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      ctx.clearRect(0, 0, W, H)

      if (mi !== lastMi && d && ms[mi]) {
        lastMi = mi
        for (const t of d.byMonth[ms[mi]] || []) {
          const nd = ns.find(n => n.name === t.legislator)
          if (!nd) continue
          const col = t.type === 'purchase' ? PULSE_BUY : t.type === 'sale_full' ? PULSE_SELL : PULSE_EXCH
          pulses.push({ x: nd.x * W, y: nd.y * H, maxR: iesRadius(nd.ies) * 2.8 + 10, r: 0, col, born: Date.now() })
        }
        while (pulses.length > 100) pulses.shift()
      }

      const now = Date.now()
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p   = pulses[i]
        const age = (now - p.born) / 1400
        if (age > 1) { pulses.splice(i, 1); continue }
        p.r = p.maxR * age
        const alpha = (0.7 * (1 - age * age)).toFixed(2)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${p.col},${alpha})`
        ctx.lineWidth   = 1.5
        ctx.stroke()
      }

      if (d && ms[mi]) {
        const byCompany = new Map<string, Node[]>()
        for (const t of d.byMonth[ms[mi]] || []) {
          const nd = ns.find(n => n.name === t.legislator)
          if (!nd) continue
          if (!byCompany.has(t.company)) byCompany.set(t.company, [])
          byCompany.get(t.company)!.push(nd)
        }
        for (const group of Array.from(byCompany.values())) {
          const unique = Array.from(new Map(group.map(n => [n.name, n] as [string, Node])).values())
          for (let a = 0; a < unique.length; a++) {
            for (let b = a + 1; b < unique.length; b++) {
              ctx.beginPath()
              ctx.moveTo(unique[a].x * W, unique[a].y * H)
              ctx.lineTo(unique[b].x * W, unique[b].y * H)
              ctx.strokeStyle = 'rgba(34,211,238,0.20)'
              ctx.lineWidth   = 0.8
              ctx.stroke()
            }
          }
        }
      }

      const { hovered: hov } = stateRef.current
      for (const nd of ns) {
        const x  = nd.x * W
        const y  = nd.y * H
        const r  = iesRadius(nd.ies)
        const isHov = hov === nd.name
        if ((nd.ies || 0) >= 20) {
          const grd = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 4)
          const gl  = Math.min(0.35, (nd.ies - 20) / 22 * 0.35 + 0.08)
          grd.addColorStop(0, `rgba(239,68,68,${gl.toFixed(2)})`)
          grd.addColorStop(1, 'rgba(239,68,68,0)')
          ctx.beginPath()
          ctx.arc(x, y, r * 4, 0, Math.PI * 2)
          ctx.fillStyle = grd
          ctx.fill()
        }
        ctx.beginPath()
        ctx.arc(x, y, isHov ? r + 2.5 : r, 0, Math.PI * 2)
        ctx.fillStyle   = PARTY_COLOR[nd.party] || '#6b7280'
        ctx.globalAlpha = 0.88
        ctx.fill()
        ctx.globalAlpha = 1
        if (isHov) {
          ctx.beginPath()
          ctx.arc(x, y, r + 5, 0, Math.PI * 2)
          ctx.strokeStyle = '#e2e8f0'
          ctx.lineWidth   = 1.5
          ctx.stroke()
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [rawData, nodes])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !nodes.length) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const W  = canvas.offsetWidth
    const H  = canvas.offsetHeight
    let found: string | null = null
    for (const n of nodes) {
      const dx = n.x * W - mx
      const dy = n.y * H - my
      if (Math.sqrt(dx * dx + dy * dy) < iesRadius(n.ies) + 7) { found = n.name; break }
    }
    setHovered(found)
  }, [nodes])

  useEffect(() => {
    if (!playing || months.length === 0) return
    const ms = Math.round(600 / speed)
    const id = setInterval(() => {
      setMonthIdx(prev => {
        if (prev >= months.length - 1) { setPlaying(false); return prev }
        return prev + 1
      })
    }, ms)
    return () => clearInterval(id)
  }, [playing, months, speed])

  const monthTrades = rawData && months[monthIdx] ? (rawData.byMonth[months[monthIdx]] || []) : []
  const buys  = monthTrades.filter(t => t.type === 'purchase').length
  const sells = monthTrades.filter(t => t.type === 'sale_full').length
  const exch  = monthTrades.filter(t => t.type === 'exchange').length
  const hovNode   = hovered && rawData ? rawData.legislators.find(l => l.name === hovered) : null
  const hovTrades = hovered && rawData ? rawData.trades.filter(t => t.legislator === hovered).slice(-5) : []

  if (!rawData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-mono text-sm">
        <span className="animate-pulse">Loading influence data...</span>
      </div>
    )
  }

  return (
    <div className="bg-gray-950 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-gray-800">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-cyan-500 text-xs tracking-widest uppercase mb-1">
              Live Graph · {rawData.trades.length.toLocaleString()} trades · {rawData.legislators.length} legislators
            </div>
            <h3 className="text-xl font-bold text-gray-100">Influence Weather Map</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Congressional stock trades 2024–2026 · scrub timeline · hover nodes to inspect
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {([
              ['partyFilt', partyFilt, setPartyFilt, [['all','All parties'],['D','Democrat'],['R','Republican'],['I','Independent']]] as const,
              ['tierFilt',  tierFilt,  setTierFilt,  [['all','All risk tiers'],['critical','Critical (≥30)'],['high','High (≥20)'],['elevated','Elevated (≥10)'],['low','Low']]] as const,
            ] as [string, string, (v: string) => void, readonly (readonly [string, string])[]][]).map(([key, val, setter, opts]) => (
              <select key={key} value={val} onChange={e => setter(e.target.value)}
                aria-label={key === 'partyFilt' ? 'Filter by party' : 'Filter by IES risk tier'}
                className="bg-gray-900 border border-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded font-mono focus:outline-none"
              >
                {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500">
          {[['D','Democrat','#3b82f6'],['R','Republican','#ef4444'],['I','Independent','#eab308']].map(([k, lbl, col]) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ background: col }} />
              {lbl}
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-cyan-700">
            <span className="w-5 border-t border-cyan-600/50 inline-block" />
            co-traded same stock
          </span>
          <span className="text-gray-600">· node size = IES · red glow = high influence</span>
        </div>
      </div>

      <div className="relative bg-gray-950" style={{ height: '420px' }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          aria-label="Congressional influence map showing legislators as nodes with stock trade activity"
          role="img"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: hovered ? 'pointer' : 'crosshair' }}
        />

        <div className="absolute top-3 left-3 bg-gray-900/92 backdrop-blur border border-gray-700 rounded-lg px-3 py-2 text-xs font-mono pointer-events-none">
          <div className="text-cyan-400 font-bold text-lg leading-none tabular-nums">{months[monthIdx]}</div>
          <div className="text-gray-500 mt-0.5">{monthTrades.length} trades</div>
        </div>

        {monthTrades.length > 0 && (
          <div className="absolute top-3 right-3 bg-gray-900/92 backdrop-blur border border-gray-700 rounded-lg px-3 py-2 text-xs font-mono pointer-events-none">
            <div className="flex gap-3 mb-1.5">
              <span className="text-green-400 tabular-nums">▲ {buys}</span>
              <span className="text-red-400   tabular-nums">▼ {sells}</span>
              {exch > 0 && <span className="text-yellow-400 tabular-nums">⇄ {exch}</span>}
            </div>
            <div className="flex h-1 rounded overflow-hidden w-24 bg-gray-800">
              <div className="bg-green-500 transition-all" style={{ width: `${(buys / monthTrades.length) * 100}%` }} />
              <div className="bg-yellow-500 transition-all" style={{ width: `${(exch / monthTrades.length) * 100}%` }} />
              <div className="bg-red-500 flex-1" />
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3
                        bg-gray-900/80 backdrop-blur-md px-4 py-2 rounded-xl
                        border border-cyan-500/20 shadow-lg z-20">
          <button
            onClick={() => setPlaying(p => !p)}
            className="bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-gray-950 font-bold
                       text-xs px-3 py-1.5 rounded-lg transition-colors min-w-[72px]"
          >
            {playing ? '⏸ PAUSE' : '▶ PLAY'}
          </button>
          <div className="w-px h-5 bg-gray-600 shrink-0" />
          {[0.5, 1, 2, 3].map(s => (
            <button key={s} onClick={() => setSpeed(s)}
              className={`text-xs px-2 py-1 rounded transition-colors font-mono tabular-nums ${
                speed === s ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {s}×
            </button>
          ))}
          <div className="w-px h-5 bg-gray-600 shrink-0" />
          <button
            onClick={() => { setMonthIdx(0); setPlaying(false) }}
            className="text-gray-500 hover:text-gray-300 text-xs px-2 py-1 rounded transition-colors border border-gray-700 hover:border-gray-500"
            title="Reset to first month"
          >
            ↺
          </button>
        </div>

        <div className="absolute bottom-16 right-3 bg-gray-900/75 backdrop-blur border border-gray-700/60 rounded-lg px-3 py-2 text-[10px] font-mono pointer-events-none select-none space-y-1 z-10">
          {[['#3b82f6','Democrat'],['#ef4444','Republican'],['#eab308','Independent']].map(([col, lbl]) => (
            <div key={lbl} className="flex items-center gap-1.5 text-gray-400">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: col }} />
              {lbl}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-gray-500 pt-0.5 border-t border-gray-700/50">
            <span className="text-red-500/70">●</span> IES ≥ 20 glow
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <span className="text-[8px]">─</span>
            <span className="text-cyan-700">co-traded</span>
          </div>
        </div>

        {hovNode && (
          <div className="absolute bottom-16 left-3 bg-gray-900/97 border border-gray-600 rounded-xl p-4 min-w-56 max-w-68 text-xs font-mono pointer-events-none shadow-2xl z-10">
            <div className="font-bold text-gray-100 text-sm mb-1.5 tracking-wide">{hovNode.name}</div>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-semibold px-2 py-0.5 rounded text-xs" style={{
                background: (PARTY_COLOR[hovNode.party] || '#6b7280') + '22',
                color:       PARTY_COLOR[hovNode.party] || '#6b7280',
                border:     `1px solid ${(PARTY_COLOR[hovNode.party] || '#6b7280')}44`,
              }}>
                {hovNode.party === 'D' ? 'Democrat' : hovNode.party === 'R' ? 'Republican' : hovNode.party || 'Unknown'}
              </span>
              <span className={`font-bold ${
                (hovNode.ies || 0) >= 30 ? 'text-red-400' :
                (hovNode.ies || 0) >= 20 ? 'text-orange-400' :
                (hovNode.ies || 0) >= 10 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                IES {hovNode.ies?.toFixed(1) ?? '—'}
              </span>
            </div>
            {hovTrades.length > 0 && (
              <div>
                <div className="text-gray-600 mb-1.5 uppercase tracking-widest text-[10px]">Recent trades</div>
                {hovTrades.map((t, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-gray-400 mb-0.5">
                    <span className={t.type === 'purchase' ? 'text-green-400' : t.type === 'sale_full' ? 'text-red-400' : 'text-yellow-400'}>
                      {t.type === 'purchase' ? '▲' : t.type === 'sale_full' ? '▼' : '⇄'}
                    </span>
                    <span className="flex-1 truncate">{(t.company || '').slice(0, 24)}</span>
                    <span className="text-gray-600 shrink-0">{t.date?.slice(0, 7)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-6 pb-6 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">Timeline</span>
          <span className="text-xs text-gray-600 font-mono tabular-nums">{monthIdx + 1} / {months.length}</span>
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(0, months.length - 1)}
          value={monthIdx}
          onChange={e => { setPlaying(false); setMonthIdx(Number(e.target.value)) }}
          aria-label={`Timeline month scrubber — ${months[monthIdx] || ''}`}
          className="w-full cursor-pointer"
          style={{ accentColor: '#22d3ee' }}
        />
        <div className="flex justify-between mt-1 text-[10px] text-gray-700 font-mono overflow-hidden select-none">
          {months
            .filter((_, i) => months.length <= 12 || i % Math.ceil(months.length / 10) === 0)
            .map(m => <span key={m}>{m}</span>)
          }
        </div>
        {monthTrades.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3 text-xs font-mono">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
              <div className="text-cyan-400 font-bold text-lg tabular-nums">{monthTrades.length}</div>
              <div className="text-gray-600 mt-0.5">trades</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
              <div className="text-green-400 font-bold text-lg tabular-nums">{buys}</div>
              <div className="text-gray-600 mt-0.5">buys</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
              <div className="text-red-400 font-bold text-lg tabular-nums">{sells}</div>
              <div className="text-gray-600 mt-0.5">sells</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
