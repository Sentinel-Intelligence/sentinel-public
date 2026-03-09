import type { Metadata } from 'next'
import { Scale, Eye, FileCheck2, Code2, Unlock, Microscope, FileText, Settings2, Sparkles, Github } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Sentinel Intelligence | Mission & Principles',
  description: 'Sentinel Intelligence is a nonpartisan, open-source project mapping congressional influence networks. Built for journalists, researchers, and the public. MIT licensed, source-verified, free forever.',
  alternates: {
    canonical: 'https://sentinelintel.org/about',
  },
}

const PRINCIPLES = [
  { Icon: Scale,      title: 'Nonpartisan',     desc: 'No political bias. Data speaks for itself.' },
  { Icon: Eye,        title: 'Non-Accusatory',  desc: 'We map connections, never assign guilt.' },
  { Icon: FileCheck2, title: 'Source-Verified', desc: 'Every data point traces to a federal filing.' },
  { Icon: Code2,      title: 'Open Source',     desc: 'Methodology and tools publicly available. MIT License.' },
  { Icon: Unlock,     title: 'Free Forever',    desc: 'No paywall. No premium tier for data.' },
  { Icon: Microscope, title: 'Self-Skeptical',  desc: 'We publish our limitations and error rates.' },
]

export default function AboutPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-cyan-500 text-xs tracking-widest uppercase mb-4">Open Source</div>
      <h1 className="text-3xl font-bold mb-6">Open to everyone. Built for accountability.</h1>
      <p className="text-gray-400 mb-10 max-w-2xl">
        Methodology and tools publicly available. Core graph construction is being prepared
        for full open-source release. If you&apos;re a researcher, journalist, or
        developer — this is for you.
      </p>

      {/* Research */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-gray-900 border border-cyan-800 rounded-lg p-6">
          <div className="mb-3"><FileText size={22} className="text-cyan-400" /></div>
          <div className="font-bold text-cyan-300 mb-1">IC2S2 2026 — Under Review</div>
          <p className="text-gray-500 text-xs italic mb-2">
            &ldquo;Mapping Institutional Capture: A Graph-Based Framework for Detecting Political Influence Networks in U.S. Congressional Financial Disclosures&rdquo;
          </p>
          <p className="text-gray-400 text-sm">
            Submitted to the International Conference on Computational Social Science 2026.
            Full paper forthcoming.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="mb-3"><Settings2 size={22} className="text-cyan-400" /></div>
          <div className="font-bold text-cyan-300 mb-2">Pipeline Release</div>
          <p className="text-gray-400 text-sm">Coming soon: full ingestion pipeline, graph schema, validation notebooks, and fine-tuning recipes.</p>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="mb-3"><Sparkles size={22} className="text-cyan-400" /></div>
          <div className="font-bold text-cyan-300 mb-2">Live Oracle</div>
          <p className="text-gray-400 text-sm">Coming soon: natural language query interface for journalists and researchers. Ask anything about the graph.</p>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="mb-3"><Github size={22} className="text-cyan-400" /></div>
          <div className="font-bold text-cyan-300 mb-2">GitHub</div>
          <p className="text-gray-400 text-sm">Methodology and tools publicly available. Core graph construction being prepared for full open-source release.</p>
          <div className="mt-3">
            <a
              href="https://github.com/Sentinel-Intelligence/sentinel-public"
              className="text-cyan-500 text-xs border border-cyan-900 px-3 py-1 rounded hover:border-cyan-700 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/Sentinel-Intelligence/sentinel-public →
            </a>
          </div>
        </div>
      </div>

      {/* Principles */}
      <h2 className="text-xl font-semibold text-cyan-300 mb-6">Our Principles</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {PRINCIPLES.map(p => (
          <div key={p.title} className="bg-gray-900 border border-gray-800 rounded-lg p-5 text-center hover:border-gray-600 transition-colors">
            <div className="flex justify-center mb-3"><p.Icon size={22} className="text-cyan-400" /></div>
            <div className="font-semibold text-gray-200 mb-1.5">{p.title}</div>
            <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="text-cyan-400 font-bold mb-2">MIT License</div>
        <p className="text-gray-400 text-sm">Free to use, modify, and distribute. Attribution appreciated. Built for the public interest.</p>
      </div>
    </section>
  )
}
