# The Sentinel Project

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Website](https://img.shields.io/badge/Web-sentinelintel.org-cyan)](https://sentinelintel.org)
[![XRPL Provenance](https://img.shields.io/badge/XRPL-453_as_of_2026.08.23-purple)](https://livenet.xrpl.org/accounts/rLFteU7TV2dP2UNteJPFJE8h8sJjPjqkLV)

**Among the largest open graphs of congressional influence ever built.**

33M+ entities · 72.88M+ connections · 10 federal databases

---

## What is Sentinel?

Sentinel is a Neo4j knowledge graph that fuses 15+ public federal databases to map influence networks in the U.S. Congress. Every legislator, company, PAC, lobbyist, trade, donation, and committee relationship is connected in a single queryable graph.

The system scores all 1,228 current and recent legislators with the **Influence Exposure Score (IES v3.5)**.

Graph state is anchored to the XRP Ledger at intervals. As of 2026-08-13 the provenance wallet rLFteU7TV2dP2UNteJPFJE8h8sJjPjqkLV carries 311 graph-state anchors, the earliest dated 2026-02-09 and the most recent 2026-07-27. An anchor records a hash of graph state at a point in time. It is not a per-node or per-edge certificate. See [docs/verification.md](docs/verification.md) for the public verification procedure.

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

- **Behavioral Sorting:** Reform pressure split Congress into Quitters (40 stopped trading), Defiant (14 continued), and Whales (28; fewer trades, massive dollars)
- **Sell Spike:** Sell-side activity spiked to 62.1% in Q3 2023, collapsed to 12.4% in Q4 2024 when the ban failed
- **Jurisdiction Conflicts:** Legislators continue trading stocks under their own committee's jurisdiction
- **CHIPS Act Window:** 18 semiconductor trades by members of Congress during the June-September 2022 legislative window

## Repository Structure

```
docs/
  methodology.md    — IES v3.5 full specification and validation
  schema.md         — Graph schema: 67 node labels, 104 relationship types
  data_sources.md   — All federal data sources with URLs and update frequencies
  verification.md   — Public XRPL provenance verification procedure
scripts/
  cypher_examples.py — 10 example Cypher queries with documentation
  xrpl_anchor.py     — SHIELD provenance anchoring to XRPL mainnet
```

## Citation

> Brown, B., and Ellefritz, R. (2026). Structural Influence Detection in U.S. Federal Politics: A Multi-Source Knowledge Graph Approach. Accepted, Poster 429, IC2S2 2026.

## Links

- **Website:** [sentinelintel.org](https://sentinelintel.org)
- **Contact:** contact@sentinelintel.org
- **XRPL Provenance:** [Ledger Explorer](https://livenet.xrpl.org/accounts/rLFteU7TV2dP2UNteJPFJE8h8sJjPjqkLV)

---

*Built with public federal data. 100% IRONCLAD provenance.*
*Patent pending.*
*© 2026 Sentinel Intelligence, a project of ArgusForge LLC. MIT License.*

## Verified Graph Statistics (March 10, 2026)

| Metric | Value |
|--------|-------|
| Nodes | 465,263 |
| Edges | 7,341,318 |
| Node Labels | 67 |
| Relationship Types | 104 |
| Legislators Scored (IES v3.5) | 1,228 / 1,228 (100%) |
| XRPL provenance anchors | 142 evidence-anchor, 311 graph-state, 453 family total as of 2026-08-23 (AccountSet tesSUCCESS; publicly checkable) |
| SAME_AS Entity Resolution Edges | 46,695 |
| Stock Trades (TRADED_STOCK) | 16,238 |

## Current Status

Sentinel is in active development. The full ingestion pipeline and Neo4j load procedures will be published as they stabilize.

**What's here now:**
- Full graph schema documentation (67 labels, 104 relationship types)
- IES v3.5 methodology and validation
- 10 documented Cypher query examples
- XRPL provenance anchoring script
- All 15+ federal data source specifications

Additional tooling will be published as it is ready for release.

## Academic & Government Submissions

- **IC2S2 2026** - Accepted, Poster 429, Structural Influence Detection in U.S. Federal Politics: A Multi-Source Knowledge Graph Approach (Brown and Ellefritz)
- **NIST CAISI RFI** — AI Agent Security response, Docket NIST-2025-0035 (March 2026)
- **NCCoE Agent Identity** — Software and AI Agent Identity concept paper (April 2026)

## Contact

- Website: [sentinelintel.org](https://sentinelintel.org)
- XRPL Wallet: [rLFteU7TV2dP2UNteJPFJE8h8sJjPjqkLV](https://livenet.xrpl.org/accounts/rLFteU7TV2dP2UNteJPFJE8h8sJjPjqkLV)
- License: MIT
