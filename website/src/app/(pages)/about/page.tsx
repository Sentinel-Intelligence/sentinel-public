import type { Metadata } from 'next'
import { Scale, Eye, FileCheck2, Code2, Unlock, Microscope, Github } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Sentinel Intelligence | Mission and principles',
  description:
    'Sentinel Intelligence is a nonpartisan, MIT-licensed project mapping U.S. political finance from federal filings. Check-us positioning, source-verified, free to use.',
  alternates: {
    canonical: 'https://sentinelintel.org/about',
  },
}

const PRINCIPLES = [
  { Icon: Scale, title: 'Nonpartisan', desc: 'No political bias. Data speaks for itself.' },
  { Icon: Eye, title: 'Non-accusatory', desc: 'We map connections. We do not assign guilt.' },
  { Icon: FileCheck2, title: 'Source-verified', desc: 'Every data point should trace to a federal filing when one exists.' },
  { Icon: Code2, title: 'Open methods', desc: 'Methodology and public tooling under MIT License.' },
  { Icon: Unlock, title: 'No paywall for the claim', desc: 'The check-us claim and source discipline are free to inspect.' },
  { Icon: Microscope, title: 'Self-skeptical', desc: 'We publish limitations, retirements, and what replaced failed claims.' },
]

export default function AboutPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-cyan-500 text-xs tracking-widest uppercase mb-4">About</div>
      <h1 className="text-3xl font-bold mb-6">Why you can check us</h1>
      <p className="text-gray-400 mb-6 max-w-2xl text-sm leading-relaxed">
        Sentinel Intelligence is built by one person from public federal data under an MIT
        license. The work is nonpartisan and non-accusatory: connections are mapped; guilt
        is not assigned.
      </p>
      <p className="text-gray-500 mb-10 max-w-2xl text-sm leading-relaxed">
        What we show you is what we ingested. We can prove when we ingested it. We can
        prove we have not altered it since. We cannot prove the filer told the truth.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="mb-3"><Code2 size={22} className="text-cyan-400" /></div>
          <div className="font-bold text-cyan-300 mb-2">Open tools</div>
          <p className="text-gray-400 text-sm">
            Methodology and public tooling under MIT. Graph construction packages release
            when they meet the same check-us standard as the site claim. No release date is
            promised here.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="mb-3"><Github size={22} className="text-cyan-400" /></div>
          <div className="font-bold text-cyan-300 mb-2">Public repository</div>
          <p className="text-gray-400 text-sm mb-3">
            Source and site material that is cleared for public release live on GitHub.
          </p>
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

      <h2 className="text-xl font-semibold text-cyan-300 mb-6">Principles</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {PRINCIPLES.map((p) => (
          <div
            key={p.title}
            className="bg-gray-900 border border-gray-800 rounded-lg p-5 text-center hover:border-gray-600 transition-colors"
          >
            <div className="flex justify-center mb-3">
              <p.Icon size={22} className="text-cyan-400" />
            </div>
            <div className="font-semibold text-gray-200 mb-1.5">{p.title}</div>
            <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="text-cyan-400 font-bold mb-2">MIT License</div>
        <p className="text-gray-400 text-sm">
          Free to use, modify, and distribute. Attribution appreciated. Built for the public interest.
        </p>
      </div>
    </section>
  )
}
