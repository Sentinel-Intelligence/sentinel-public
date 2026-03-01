# The Sentinel Project

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Website](https://img.shields.io/badge/Web-sentinelintel.org-cyan)](https://sentinelintel.org)
[![XRPL Provenance](https://img.shields.io/badge/XRPL-239%20Proofs-purple)](https://livenet.xrpl.org/accounts/rLFteU7TV2dP2UNteJPFJE8h8sJjPjqkLV)

**The largest open graph of congressional influence ever built.**

429K entities · 7.29M connections · 15+ federal databases · AUC 0.9575

---

## What is Sentinel?

Sentinel is a Neo4j knowledge graph that fuses 15+ public federal databases to map influence networks in the U.S. Congress. Every legislator, company, PAC, lobbyist, trade, donation, and committee relationship is connected in a single queryable graph.

The system scores all 1,228 current and recent legislators with the **Influence Exposure Score (IES v3.5)**, validated at AUC 0.9575 across multiple models on 34 audited cases of closed-loop corruption.

A fine-tuned **Sentinel Oracle** (Qwen2.5-14B) translates natural language questions into executable Cypher queries with 98.6% execution accuracy (71/72 held-out queries, 100% syntax validity). Every node, edge, and score is anchored to the XRPL blockchain for immutable public provenance.

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
  schema.md         — Graph schema: 58 node labels, 98 relationship types
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

## Oracle Benchmark (March 1, 2026)

| Metric | Value |
|--------|-------|
| Execution Accuracy | **98.6%** (71/72) |
| Syntax Validity | **100%** (72/72) |
| Model | Qwen2.5-14B (LoRA fine-tuned on 20,055 Cypher pairs) |
| Test Set | 72 held-out domain queries |
| Baseline (no schema hints) | 97.2% (70/72) |

## Verified Graph Statistics (March 1, 2026)

| Metric | Value |
|--------|-------|
| Nodes | 429,332 |
| Edges | 7,296,068 |
| Node Labels | 58 |
| Relationship Types | 98 |
| Legislators Scored (IES v3.5) | 1,228 / 1,228 (100%) |
| XRPL Provenance Proofs | 239 (mainnet, verified) |
| SAME_AS Entity Resolution Edges | 46,695 |
| Stock Trades (TRADED_STOCK) | 16,238 |

## Current Status

Sentinel is in active development. The full ingestion pipeline, Oracle deployment scripts, and Neo4j load procedures will be published following completion of the peer review process for our IC2S2 2026 submission.

**What's here now:**
- Full graph schema documentation (58 labels, 98 relationship types)
- IES v3.5 methodology and validation
- 10 documented Cypher query examples
- XRPL provenance anchoring script
- All 15+ federal data source specifications

**Coming soon:**
- Phoenix ingestion pipeline (Scrapy-based federal data ETL)
- Oracle Modelfile and deployment configuration
- SCIP continuous integration modules
- Benchmark test suite and results

## Academic & Government Submissions

- **IC2S2 2026** — Submitted March 2026, 12th International Conference on Computational Social Science
- **NIST CAISI RFI** — AI Agent Security response, Docket NIST-2025-0035 (March 2026)
- **NCCoE Agent Identity** — Software and AI Agent Identity concept paper (April 2026)

## Contact

- Website: [sentinelintel.org](https://sentinelintel.org)
- XRPL Wallet: [rLFteU7TV2dP2UNteJPFJE8h8sJjPjqkLV](https://livenet.xrpl.org/accounts/rLFteU7TV2dP2UNteJPFJE8h8sJjPjqkLV)
- License: MIT
