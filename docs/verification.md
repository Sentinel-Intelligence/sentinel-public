# XRPL Provenance Verification

Public procedure for independently verifying Sentinel Intelligence XRPL provenance anchors.
Requires: `pip install xrpl-py`. No API key required.

## Script (copy-paste ready)

```python
#!/usr/bin/env python3
"""
Verify Sentinel Intelligence XRPL provenance anchors.
Wallet: rLFteU7TV2dP2UNteJPFJE8h8sJjPjqkLV
RPC:    https://xrplcluster.com  (public, no key required)
"""
from collections import Counter
from xrpl.clients import JsonRpcClient
from xrpl.models.requests import AccountTx

WALLET = "rLFteU7TV2dP2UNteJPFJE8h8sJjPjqkLV"
RPC    = "https://xrplcluster.com"

MEMO_CLASSES = [
    "sentinel/graph-anchor/v1",
    "sentinel/trust-anchor/v1",
    "sentinel/evidence-anchor/v1",
    "smelt/governance",
    "smelt/wave-provenance/v1",
    "sentinel/nist-caisi/v1",
    "sentinel/gatekeeper",
    "SMELT_NIST_EVIDENCE_v0.3",
]

def decode_hex(h):
    try:
        return bytes.fromhex(h).decode("utf-8", errors="replace") if h else ""
    except Exception:
        return ""

client  = JsonRpcClient(RPC)
counts  = Counter()
most_recent = None
marker  = None
page    = 0

while True:
    kwargs = {"account": WALLET, "limit": 400}
    if marker:
        kwargs["marker"] = marker
    result = client.request(AccountTx(**kwargs)).result
    txs    = result.get("transactions", [])
    page  += 1
    print(f"page {page}: {len(txs)} txs")

    for env in txs:
        # Key fix: use tx_json (current RPC shape), fall back to tx (legacy)
        body = env.get("tx_json") or env.get("tx") or {}
        if body.get("TransactionType") != "AccountSet":
            continue
        memos = body.get("Memos") or []
        if not memos:
            continue
        close = env.get("close_time_iso")
        for mwrap in memos:
            memo = mwrap.get("Memo") or mwrap
            mt   = decode_hex(memo.get("MemoType", ""))
            counts[mt] += 1
        if close and (most_recent is None or close > most_recent):
            most_recent = close

    marker = result.get("marker")
    if not marker:
        break

print("\nPer-class counts:")
for cls in MEMO_CLASSES:
    print(f"  {cls:<44} {counts.get(cls, 0):5d}")
print(f"\nTotal AccountSet+Memo : {sum(counts.values())}")
print(f"Most recent anchor    : {most_recent or '(none)'}")
```

> **Correction, 2026-08-13.** An earlier published version of this procedure read
> the transaction body from a field the public RPC no longer returns and therefore
> reported no anchors. The on-chain records were unaffected and have been present
> since 2026-02-09. The procedure above is the corrected version and returns 3,468
> anchor memos across eight classes as of 2026-08-13.
