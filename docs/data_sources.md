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
