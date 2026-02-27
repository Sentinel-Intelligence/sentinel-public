#!/bin/bash
# SENTINEL PUBLIC REPO BUILDER
# Run on Bastion: bash build_public_repo.sh
# Creates all files and pushes to GitHub

set -e

REPO_DIR="$HOME/projects/sentinel-public"

echo "=== Building sentinel-public repo ==="

# Clean and init
cd "$REPO_DIR"
rm -rf .git
git init
git remote add origin git@github.com:Sentinel-Intelligence/sentinel-public.git

mkdir -p docs scripts

##############################################
# README.md
##############################################
cat > README.md << 'EOF'
# The Sentinel Project

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Website](https://img.shields.io/badge/Web-sentinelintel.org-cyan)](https://sentinelintel.org)
[![XRPL Provenance](https://img.shields.io/badge/XRPL-200%2B%20Proofs-purple)](https://livenet.xrpl.org/accounts/rLFteU7TV2dP2UNteJPFJE8h8sJjPjqkLV)

**The largest open graph of congressional influence ever built.**

427K entities · 7.2M connections · 15+ federal databases · AUC 0.9575

---

## What is Sentinel?

Sentinel is a Neo4j knowledge graph that fuses 15+ public federal databases to map influence networks in the U.S. Congress. Every legislator, company, PAC, lobbyist, trade, donation, and committee relationship is connected in a single queryable graph.

The system scores all 1,228 current and recent legislators with the **Influence Exposure Score (IES v3.5)**, validated at AUC 0.9575 across multiple models on 31 audited cases of closed-loop corruption.

A fine-tuned **Sentinel Oracle** (Qwen2.5-14B) translates natural language questions into executable Cypher queries with 95% accuracy. Every node, edge, and score is anchored to the XRPL blockchain for immutable public provenance.

## Data Sources

| Source | Records | Type |
|--------|---------|------|
| FEC Contributions | 719K+ donations | Campaign finance |
| House PTR / Senate eFD | 16,381 trades | Stock trading disclosures |
| Lobbying Disclosure Act | 574K+ lobbying edges | Lobbying activity |
| FARA | Foreign agent registrations | Foreign influence |
| USAspending | 1.35M+ contracts | Federal contracts |
| SEC EDGAR Form 4 | 67K+ insider trades | Corporate insider activity |
| Voteview / Congress.gov | Voting records | Legislative behavior |
| CourtListener | Judicial connections | Legal enforcement |

## Key Findings

- **Behavioral Sorting:** Reform pressure split Congress into Quitters (20+ stopped trading), Defiant (15+ continued), and Whales (fewer trades, massive dollars)
- **Sell Spike:** Sell-side activity spiked to 62.1% in Q3 2023, collapsed to 12.4% in Q4 2024 when the ban failed
- **Jurisdiction Conflicts:** Legislators continue trading stocks under their own committee's jurisdiction
- **CHIPS Act Window:** 18 semiconductor trades by members of Congress during the June-September 2022 legislative window

## Repository Structure

```
docs/
  methodology.md    — IES v3.5 full specification and validation
  schema.md         — Graph schema: 55 node labels, 94 relationship types
  data_sources.md   — All federal data sources with URLs and update frequencies
scripts/
  cypher_examples.py — 10 example Cypher queries with documentation
  xrpl_anchor.py     — SHIELD provenance anchoring to XRPL mainnet
```

## Citation

> Sentinel Intelligence. (2026). Mapping Institutional Capture: A Graph-Based Framework for Detecting Political Influence Networks in U.S. Congressional Financial Disclosures. Presented at IC2S2 2026.

## Links

- **Website:** [sentinelintel.org](https://sentinelintel.org)
- **Contact:** contact@sentinelintel.org
- **XRPL Provenance:** [Ledger Explorer](https://livenet.xrpl.org/accounts/rLFteU7TV2dP2UNteJPFJE8h8sJjPjqkLV)

---

*Built with public federal data. 100% IRONCLAD provenance.*
*© 2026 Sentinel Intelligence LLC. MIT License.*
EOF

##############################################
# LICENSE
##############################################
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2026 Sentinel Intelligence LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

##############################################
# CONTRIBUTING.md
##############################################
cat > CONTRIBUTING.md << 'EOF'
# Contributing to Sentinel

## IRONCLAD Provenance Standard

All data in the Sentinel graph must trace to public federal sources. This is non-negotiable.

**Accepted sources:** Government databases (FEC, SEC, House/Senate disclosures, FARA, USAspending, Federal Register, CourtListener, Congress.gov, Voteview), court documents, DOJ press releases, verified Congressional records.

**Not accepted:** Scraped private data, leaked documents, unverifiable claims, social media posts, anonymous tips, or speculative analysis presented as fact.

## Code Standards

- Python 3.12+
- Type hints on all function signatures
- Docstrings on all public functions
- Tests for new features
- No hardcoded credentials

## Principles

- Accuracy over speed
- No partisan framing — the data speaks for itself
- Respect privacy of non-public figures
- Report both positive and negative results
- Every claim must be verifiable
EOF

##############################################
# .gitignore
##############################################
cat > .gitignore << 'EOF'
__pycache__/
*.pyc
.env
*.gguf
*.bin
*.safetensors
.venv/
node_modules/
*.log
.DS_Store
data/raw/
data/cache/
*.dump
EOF

##############################################
# docs/methodology.md
##############################################
cat > docs/methodology.md << 'EOF'
# IES v3.5 — Influence Exposure Score Methodology

## Overview

The Influence Exposure Score (IES) quantifies a legislator's exposure to potential conflicts of interest by analyzing 11 dimensions of influence across the knowledge graph.

## Dimensions and Weights

| # | Dimension | Weight | Source |
|---|-----------|--------|--------|
| 1 | Trading Volume & Value | 0.12 | House PTR, Senate eFD |
| 2 | PAC Dependency Ratio | 0.11 | FEC |
| 3 | Lobbying Density | 0.10 | LDA |
| 4 | Committee Jurisdiction Overlap | 0.12 | Committee assignments + trade sectors |
| 5 | Revolving Door Score | 0.08 | LDA, FARA |
| 6 | Closed-Loop Count | 0.12 | Graph cycle detection |
| 7 | Voting Alignment with Donors | 0.09 | Voteview + FEC |
| 8 | Foreign Influence Exposure | 0.07 | FARA |
| 9 | Earmark-Donor Overlap | 0.06 | USAspending + FEC |
| 10 | Disclosure Timing Anomaly | 0.06 | PTR filing dates vs trade dates |
| 11 | Insider Trade Convergence | 0.07 | SEC Form 4 + PTR |

## Normalization

Raw scores are min-max normalized within each dimension, then weighted and summed to produce a composite score on a 0-100 scale.

## Validation

- **Burry Module AUC:** 0.9575 (GraphSAGE), 0.9588 (MLP), 0.9362 (XGBoost)
- **Ground truth:** 31 audited cases of closed-loop corruption
- **Behavioral archetypes:** 82 legislators classified — 28 whale, 14 defiant, 40 quitter

## IRONCLAD Standard

Every IES score carries provenance metadata: source databases, ingestion timestamps, batch IDs, and XRPL anchoring for immutable verification.
EOF

##############################################
# docs/schema.md
##############################################
cat > docs/schema.md << 'EOF'
# Sentinel Graph Schema

## Summary

- **Nodes:** ~427,000 across 55 labels
- **Edges:** ~7,240,000 across 94 relationship types

## Key Node Labels

| Label | Count | Description |
|-------|-------|-------------|
| Legislator | 1,228 | Current and recent members of Congress |
| Company | ~15,000 | Public companies, contractors, lobbying clients |
| PAC | ~8,500 | Political Action Committees |
| Committee | ~250 | Congressional committees and subcommittees |
| LobbyFirm | ~3,200 | Registered lobbying firms |
| CorporateInsider | ~12,000 | SEC Form 4 reporting insiders |
| Judge | ~900 | Federal judges |
| Bill | ~5,000 | Legislation |

## Key Relationship Types

| Relationship | Count | Pattern |
|-------------|-------|---------|
| DONATED_TO | 719K | PAC -> Legislator |
| DISTRICT_CONTRACT | 1.35M | Agency -> Company |
| LOBBIED_BY | 574K | Company -> LobbyFirm |
| TRADED_STOCK | 16,381 | Legislator -> Company |
| INSIDER_TRADED | 67,393 | CorporateInsider -> Company |
| SAME_AS | 46,700 | Entity resolution links |
| MEMBER_OF | ~2,500 | Legislator -> Committee |
| FORMERLY_STAFF_OF | varies | Staffer -> Legislator |
| NOW_LOBBIES_FOR | varies | Former staffer -> Lobbying client |
| REVOLVING_DOOR | varies | Legislator <-> Private sector |
| FARA_INFLUENCED | varies | Foreign principal -> Legislator |

## Key Properties

- `Legislator.ies_v35_score` — Influence Exposure Score (0-100)
- `Legislator.behavioral_archetype` — whale / defiant / quitter
- `TRADED_STOCK.trade_date` — Date of trade
- `TRADED_STOCK.trade_type` — purchase / sale
- `DONATED_TO.amount` — Donation amount
EOF

##############################################
# docs/data_sources.md
##############################################
cat > docs/data_sources.md << 'EOF'
# Data Sources

All data in the Sentinel graph comes from public federal sources.

| Source | URL | Data Type | Update |
|--------|-----|-----------|--------|
| FEC Bulk Data | fec.gov/data/browse-data | Campaign contributions | Quarterly |
| House PTR | disclosures-clerk.house.gov | Stock trade disclosures | As filed |
| Senate eFD | efdsearch.senate.gov | Stock trade disclosures | As filed |
| LDA | lda.senate.gov | Lobbying registrations | Quarterly |
| FARA | fara.us/search | Foreign agent registrations | As filed |
| USAspending | usaspending.gov | Federal contracts & grants | Daily |
| SEC EDGAR Form 4 | sec.gov/cgi-bin/browse-edgar | Insider trades | As filed |
| Voteview | voteview.com | Roll call votes | Per session |
| Congress.gov | congress.gov | Bills, sponsors, committees | Daily |
| CourtListener | courtlistener.com | Federal court records | Daily |
| Federal Register | federalregister.gov | Regulatory actions | Daily |
| OFAC/SDN | treasury.gov/ofac | Sanctions lists | As updated |

## Entity Resolution

Entities are linked across databases using Bioguide IDs, CIK numbers, FEC IDs, and FAISS vector similarity. The SAME_AS relationship connects 46,700+ resolved entity pairs.

## IRONCLAD Provenance

Every edge carries: source database, source record ID, ingestion timestamp, and batch ID. XRPL blockchain anchoring provides immutable verification.
EOF

##############################################
# scripts/cypher_examples.py
##############################################
cat > scripts/cypher_examples.py << 'PYEOF'
"""
Sentinel — Example Cypher Queries
Run against the Sentinel Neo4j graph (bolt://localhost:7687)
"""

QUERIES = {
    "closed_loop_detection": """
        // Find legislators trading stocks of companies whose PACs donate to them
        MATCH (l:Legislator)-[t:TRADED_STOCK]->(c:Company)
        MATCH (c)-[:OPERATES]->(pac:PAC)-[d:DONATED_TO]->(l)
        WHERE t.trade_date >= date('2024-01-01')
        RETURN l.name, c.name, t.trade_type, d.amount
        ORDER BY d.amount DESC LIMIT 25
    """,

    "committee_jurisdiction_conflicts": """
        // Armed Services members trading defense stocks
        MATCH (l:Legislator)-[:MEMBER_OF]->(com:Committee)
        WHERE com.name CONTAINS 'Armed Services'
        MATCH (l)-[t:TRADED_STOCK]->(c:Company)
        WHERE c.sector IN ['Aerospace & Defense', 'Defense']
        RETURN l.name, c.name, t.trade_type, t.amount, t.trade_date
        ORDER BY t.trade_date DESC
    """,

    "ies_leaderboard": """
        // Top 25 legislators by Influence Exposure Score
        MATCH (l:Legislator)
        WHERE l.ies_v35_score IS NOT NULL
        RETURN l.name, l.party, l.state, l.ies_v35_score, l.behavioral_archetype
        ORDER BY l.ies_v35_score DESC LIMIT 25
    """,

    "behavioral_archetypes": """
        // Distribution of behavioral archetypes
        MATCH (l:Legislator)
        WHERE l.behavioral_archetype IS NOT NULL
        RETURN l.behavioral_archetype AS archetype, count(l) AS count
        ORDER BY count DESC
    """,

    "revolving_door": """
        // Former staffers now lobbying their old bosses' committees
        MATCH (l:Legislator)<-[:FORMERLY_STAFF_OF]-(staff)-[:NOW_LOBBIES_FOR]->(client)
        RETURN l.name, staff.name, client.name
        ORDER BY l.ies_v35_score DESC LIMIT 25
    """,

    "chips_act_window": """
        // Semiconductor trades during CHIPS Act legislative window (Jun-Sep 2022)
        MATCH (l:Legislator)-[t:TRADED_STOCK]->(c:Company)
        WHERE c.sector CONTAINS 'Semiconductor'
          AND t.trade_date >= date('2022-06-01')
          AND t.trade_date <= date('2022-09-30')
        RETURN l.name, l.party, c.name, t.trade_type, t.trade_date
        ORDER BY t.trade_date
    """,

    "sell_percentage_by_quarter": """
        // Quarterly sell percentage — reform pressure indicator
        MATCH (l:Legislator)-[t:TRADED_STOCK]->(c:Company)
        WHERE t.trade_date >= date('2022-01-01')
        WITH date.truncate('quarter', t.trade_date) AS quarter,
             t.trade_type AS ttype, count(*) AS cnt
        WITH quarter,
             sum(CASE WHEN ttype = 'purchase' THEN cnt ELSE 0 END) AS buys,
             sum(CASE WHEN ttype = 'sale' THEN cnt ELSE 0 END) AS sells
        RETURN toString(quarter) AS quarter, buys, sells,
               round(100.0 * sells / (buys + sells), 1) AS sell_pct
        ORDER BY quarter
    """,

    "graph_stats": """
        // Current graph statistics
        CALL db.labels() YIELD label WITH count(label) AS labelCount
        CALL db.relationshipTypes() YIELD relationshipType WITH labelCount, count(relationshipType) AS relCount
        MATCH (n) WITH labelCount, relCount, count(n) AS nodes
        MATCH ()-[r]->() RETURN nodes, labelCount AS labels, relCount AS rel_types, count(r) AS edges
    """,
}

if __name__ == "__main__":
    for name, query in QUERIES.items():
        print(f"\n{'='*60}")
        print(f"  {name}")
        print(f"{'='*60}")
        print(query.strip())
PYEOF

##############################################
# scripts/xrpl_anchor.py
##############################################
cat > scripts/xrpl_anchor.py << 'PYEOF'
"""
Sentinel SHIELD — XRPL Provenance Anchoring
Anchors graph state hashes to the XRP Ledger for immutable provenance.
Cost: <$0.0002/tx, 3-5s finality.

Usage:
    python xrpl_anchor.py --data '{"nodes": 427000, "edges": 7240000}' --event "graph_snapshot"
    python xrpl_anchor.py --verify TX_HASH
"""

import argparse
import hashlib
import json
import sys
from datetime import datetime


def compute_hash(data: dict) -> str:
    """SHA-256 hash of sorted JSON data."""
    canonical = json.dumps(data, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode()).hexdigest()


def merkle_root(items: list) -> str:
    """Compute Merkle root over a list of items. 100K items in ~1.9s."""
    leaves = [hashlib.sha256(json.dumps(item, sort_keys=True).encode()).digest() for item in items]
    while len(leaves) > 1:
        if len(leaves) % 2:
            leaves.append(leaves[-1])
        leaves = [hashlib.sha256(leaves[i] + leaves[i + 1]).digest() for i in range(0, len(leaves), 2)]
    return leaves[0].hex() if leaves else ""


def anchor_to_xrpl(data_hash: str, event: str, wallet_seed: str = None):
    """
    Anchor a hash to XRPL via self-send Payment with Memo.
    Requires: pip install xrpl-py
    """
    try:
        from xrpl.clients import JsonRpcClient
        from xrpl.models import Payment, Memo
        from xrpl.transaction import submit_and_wait
        from xrpl.wallet import Wallet
    except ImportError:
        print("Install xrpl-py: pip install xrpl-py")
        sys.exit(1)

    client = JsonRpcClient("https://s1.ripple.com:51234")
    wallet = Wallet.from_seed(wallet_seed) if wallet_seed else None

    if not wallet:
        print(f"DRY RUN — would anchor: {data_hash[:16]}... event={event}")
        return None

    memo = Memo(
        memo_data=bytes(json.dumps({
            "hash": data_hash, "event": event,
            "ts": datetime.utcnow().isoformat(), "v": "shield-2.0"
        }), "utf-8").hex(),
        memo_type=bytes("sentinel/proof", "utf-8").hex(),
    )

    tx = Payment(
        account=wallet.address, destination=wallet.address,
        amount="10", memos=[memo],
    )

    result = submit_and_wait(tx, client, wallet)
    return result.result["hash"]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SHIELD XRPL Anchoring")
    parser.add_argument("--data", help="JSON data to anchor")
    parser.add_argument("--event", default="manual", help="Event label")
    parser.add_argument("--verify", help="Verify a TX hash")
    parser.add_argument("--seed", help="XRPL wallet seed (omit for dry run)")
    args = parser.parse_args()

    if args.data:
        data = json.loads(args.data)
        h = compute_hash(data)
        print(f"Hash: {h}")
        tx = anchor_to_xrpl(h, args.event, args.seed)
        if tx:
            print(f"Anchored: {tx}")
    elif args.verify:
        print(f"Verify TX {args.verify} at:")
        print(f"  https://livenet.xrpl.org/transactions/{args.verify}")
    else:
        parser.print_help()
PYEOF

##############################################
# COMMIT AND PUSH
##############################################
echo ""
echo "=== All files created. Committing and pushing... ==="
echo ""

git add -A
git commit -m "Initial public release — methodology, schema, example queries, XRPL provenance"
git branch -M main
git push -u origin main

echo ""
echo "=== DONE! ==="
echo "Live at: https://github.com/Sentinel-Intelligence/sentinel-public"
echo ""
