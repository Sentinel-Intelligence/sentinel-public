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
