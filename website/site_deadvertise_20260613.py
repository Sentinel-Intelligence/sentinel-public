#!/usr/bin/env python3
"""
site_deadvertise_20260613.py
One-shot de-advertise batch for sentinel-public/website per Commander
direction 2026-06-13: strip non-live capabilities (Oracle, paid API),
purge stale and retired figures from public copy, stage the STYX landing
page, and amend deploy.sh so the STYX nginx block survives redeploys.
Run from the website root: cd ~/projects/sentinel-public/website && python3 site_deadvertise_20260613.py
Every in-place edit is exact-match asserted; graph and api-docs pages are
full-file replacements (drop-in). Aborts atomically on any assertion miss
(no file is written unless every assertion passes).
"""

import hashlib
import os
import sys

ROOT = os.getcwd()
EDITS = []   # (path, old, new) exact-match in-place
WRITES = []  # (path, content) full-file replacement / creation

P_HOME = "src/app/page.tsx"
P_METH = "src/app/(pages)/methodology/page.tsx"
P_GRAPH = "src/app/(pages)/graph/page.tsx"
P_API = "src/app/(pages)/api-docs/page.tsx"
P_DEPLOY = "deploy.sh"
P_STYX = "styx-landing/index.html"

# ---------------- HOMEPAGE: remove Oracle section + fix stale constant
EDITS.append((P_HOME,
"""import { useRouter } from 'next/navigation'
""", ""))
EDITS.append((P_HOME,
"""import OracleSearchBar from '@/components/home/OracleSearchBar'
""", ""))
EDITS.append((P_HOME,
"""// IC2S2 frozen stats
const GRAPH_STATS = { nodes: 33003274, edges: 72880000, trades: 16238 }""",
"""// Live graph figures (canonical registry 2026-06-07); trades is the frozen paper figure
const GRAPH_STATS = { nodes: 33189007, edges: 73757213, trades: 16238 }"""))
EDITS.append((P_HOME,
"""  const router = useRouter()

  const handleOracleSubmit = (q: string) => {
    router.push(`/graph?q=${encodeURIComponent(q)}`)
  }

""", ""))
EDITS.append((P_HOME,
"""      {/* Oracle search */}
      <div className="mb-16">
        <div className="text-center mb-6">
          <div className="text-cyan-500 text-xs tracking-widest uppercase mb-2">Sentinel Oracle</div>
          <h2 className="text-2xl font-bold mb-2">Ask the knowledge graph anything</h2>
          <p className="text-gray-400 text-sm">Natural language queries against 33M+ entities and 73.7M+ edges</p>
        </div>
        <OracleSearchBar onQuerySubmit={handleOracleSubmit} />
      </div>

""", ""))

# ---------------- METHODOLOGY: retire 0.9575 card, fix 408K, mark Oracle in development
EDITS.append((P_METH,
"""          <div className="text-cyan-400 font-bold text-sm mb-1">Validated at AUC 0.9575</div>
          <p className="text-gray-400 text-sm">XGBoost classifier on 420-dim embeddings (384 semantic + 36 graph-structural). Tested across multiple models.</p>""",
"""          <div className="text-cyan-400 font-bold text-sm mb-1">Dual-Pipeline Verification</div>
          <p className="text-gray-400 text-sm">Key statistics are computed by two independently engineered pipelines sharing only the primary government source, with persisted, hash-verified regeneration runs.</p>"""))
EDITS.append((P_METH,
"Immutable audit trail for all 408K+ entities.",
"Immutable audit trail across the graph."))
EDITS.append((P_METH,
"""          <div className="text-cyan-400 font-bold text-sm mb-1">Sentinel Oracle (NLQ Layer)</div>
          <p className="text-gray-400 text-sm">Fine-tuned Qwen2.5 model for natural language queries against the Neo4j knowledge graph.</p>""",
"""          <div className="text-cyan-400 font-bold text-sm mb-1">Sentinel Oracle (In Development)</div>
          <p className="text-gray-400 text-sm">Natural language query interface for the knowledge graph. Offline while dedicated serving capacity is provisioned.</p>"""))

# ---------------- GRAPH PAGE: full replacement, honest offline page
WRITES.append((P_GRAPH, """import type { Metadata } from 'next'
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
"""))

# ---------------- API DOCS: full replacement, de-advertised
WRITES.append((P_API, """import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API | Sentinel Intelligence',
  description: 'Programmatic access to the Sentinel knowledge graph is in development. Contact us for early access and research partnerships.',
  alternates: {
    canonical: 'https://sentinelintel.org/api-docs',
  },
}

export default function ApiDocsPage() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-20">
      <div className="text-cyan-500 text-xs tracking-widest uppercase mb-4">API</div>
      <h1 className="text-3xl font-bold mb-4">
        Programmatic access is <span className="text-cyan-400">in development</span>
      </h1>
      <p className="text-gray-400 mb-4 max-w-2xl">
        A public API for the Sentinel knowledge graph (legislator dossiers, trade histories,
        donation networks, conflict detection) is being built. It will launch when it meets
        the same standard as our published research: every response traceable, every figure
        verified.
      </p>
      <p className="text-gray-500 text-sm mb-10 max-w-2xl">
        Until then, nothing here is live, and we would rather say so than sell you an endpoint
        that is not ready.
      </p>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
        <div className="text-cyan-400 font-bold mb-2">Need data access now?</div>
        <p className="text-gray-400 text-sm mb-4">
          Contact us for early access, bulk data exports, or research partnerships.
        </p>
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
"""))

# ---------------- STYX LANDING (staged; deploy.sh copies it to /var/www/styx)
WRITES.append((P_STYX, """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>STYX | Sentinel Provenance Service</title>
<meta name="description" content="STYX anchors Sentinel Intelligence validation history to the XRP Ledger: hashed run manifests, immutable audit trails, publicly verifiable provenance.">
<style>
  body{margin:0;background:#030712;color:#d1d5db;font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.6}
  .wrap{max-width:680px;margin:0 auto;padding:80px 24px}
  .kicker{color:#06b6d4;font-size:12px;letter-spacing:.2em;text-transform:uppercase;margin-bottom:16px}
  h1{font-size:34px;color:#f9fafb;margin:0 0 16px}
  h1 span{color:#22d3ee}
  p{color:#9ca3af;font-size:15px}
  .card{background:#111827;border:1px solid #1f2937;border-radius:12px;padding:24px;margin:32px 0}
  .label{color:#22d3ee;font-weight:700;font-size:13px;margin-bottom:8px}
  code{display:block;background:#030712;border:1px solid #1f2937;border-radius:8px;padding:12px;color:#67e8f9;font-size:13px;overflow-x:auto}
  a{color:#22d3ee;text-decoration:none}
  a:hover{text-decoration:underline}
  .foot{margin-top:48px;font-size:13px;color:#6b7280}
</style>
</head>
<body>
<div class="wrap">
  <div class="kicker">Sentinel Intelligence</div>
  <h1>STYX <span>Provenance Service</span></h1>
  <p>STYX anchors the validation history of the Sentinel Intelligence platform to the
  XRP Ledger. Run manifests, hashed and immutable: every published figure traces to a
  persisted artifact, and the record of that verification lives on a public ledger
  that nobody, including us, can quietly rewrite.</p>
  <div class="card">
    <div class="label">Sentinel Provenance Wallet</div>
    <code>rLFteU7TV2dP2UNteJPFJE8h8sJjPjqkLV</code>
    <p style="margin-bottom:0"><a href="https://livenet.xrpl.org/accounts/rLFteU7TV2dP2UNteJPFJE8h8sJjPjqkLV" rel="noopener">Inspect the anchor history on the XRPL explorer &rarr;</a></p>
  </div>
  <p>Interactive provenance lookup tooling is in development. Once learned, it stays
  learned; this page is the public root of that guarantee.</p>
  <div class="foot"><a href="https://sentinelintel.org">&larr; sentinelintel.org</a></div>
</div>
</body>
</html>
"""))

# ---------------- DEPLOY.SH: add styx webroot copy + nginx server block
EDITS.append((P_DEPLOY,
"""echo "[deploy] Copying new build..."
sudo cp -r "$OUT"/. "$WEBROOT/"
""",
"""echo "[deploy] Copying new build..."
sudo cp -r "$OUT"/. "$WEBROOT/"

echo "[deploy] Deploying STYX landing..."
sudo mkdir -p /var/www/styx
sudo cp -r "$(dirname "$0")/styx-landing/." /var/www/styx/
"""))
EDITS.append((P_DEPLOY,
"""    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
NGINX_EOF""",
"""    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}

server {
    listen 8081;
    server_name styx.sentinelintel.org;
    root /var/www/styx;
    index index.html;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
NGINX_EOF"""))


def main():
    # Phase 1: assert everything before touching anything
    staged = {}
    for path, old, new in EDITS:
        full = os.path.join(ROOT, path)
        if not os.path.exists(full):
            print(f"FATAL missing {path}", flush=True)
            sys.exit(1)
        text = staged.get(path)
        if text is None:
            with open(full, encoding="utf-8") as f:
                text = f.read()
        n = text.count(old)
        if n != 1:
            print(f"FATAL assertion miss in {path}: expected exactly 1 "
                  f"occurrence, found {n}. First 80 chars of pattern: "
                  f"{old[:80]!r}", flush=True)
            sys.exit(1)
        staged[path] = text.replace(old, new)
    # Phase 2: write edits atomically (temp then replace)
    for path, text in staged.items():
        full = os.path.join(ROOT, path)
        tmp = full + ".tmp_deadv"
        with open(tmp, "w", encoding="utf-8") as f:
            f.write(text)
        os.replace(tmp, full)
        print(f"EDITED {path}", flush=True)
    # Phase 3: full-file writes
    for path, content in WRITES:
        full = os.path.join(ROOT, path)
        os.makedirs(os.path.dirname(full), exist_ok=True)
        tmp = full + ".tmp_deadv"
        with open(tmp, "w", encoding="utf-8") as f:
            f.write(content)
        os.replace(tmp, full)
        print(f"WROTE  {path}", flush=True)
    # Phase 4: verification greps
    bad = []
    checks = [("src", "OracleSearchBar", 1),   # only the component file itself
              ("src", "0.9575", 0),
              ("src", "463670", 0), ("src", "7338730", 0),
              ("src", "72880000", 0), ("src", "408K", 0),
              ("src", "queryOracle", 1)]       # only lib/oracle.ts remains
    for base, needle, allowed in checks:
        hits = 0
        for dirpath, _dirs, files in os.walk(os.path.join(ROOT, base)):
            for fn in files:
                if fn.endswith((".tsx", ".ts")):
                    with open(os.path.join(dirpath, fn), encoding="utf-8",
                              errors="ignore") as f:
                        if needle in f.read():
                            hits += 1
        status = "OK" if hits <= allowed else "FAIL"
        if status == "FAIL":
            bad.append(needle)
        print(f"CHECK {needle!r}: files={hits} allowed<={allowed} {status}",
              flush=True)
    sha = hashlib.sha256(open(__file__, "rb").read()).hexdigest()
    print(f"script_sha256 {sha}", flush=True)
    if bad:
        print(f"VERIFY FAILED on: {bad}", flush=True)
        sys.exit(1)
    print("COMPLETE - source edits staged; run npm build + deploy.sh to ship.",
          flush=True)


if __name__ == "__main__":
    main()
