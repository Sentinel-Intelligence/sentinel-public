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
