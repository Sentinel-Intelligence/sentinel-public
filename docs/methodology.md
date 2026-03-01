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
- **Ground truth:** 34 audited cases of closed-loop corruption
- **Behavioral archetypes:** 82 legislators classified — 28 whale, 14 defiant, 40 quitter

## IRONCLAD Standard

Every IES score carries provenance metadata: source databases, ingestion timestamps, batch IDs, and XRPL anchoring for immutable verification.
