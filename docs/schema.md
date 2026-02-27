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
