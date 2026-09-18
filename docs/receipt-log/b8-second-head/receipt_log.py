#!/usr/bin/env python3
"""Public receipt-log surfaces for the published second B-8 head.

Surfaces: get-STH, get-inclusion-proof, get-currency-proof,
get-consistency-proof, get-entries.
"""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
STH = HERE / "sth.json"
ENTRIES = HERE / "leaf_index.jsonl"
CENSUS = HERE / "census.json"
MAP = HERE / "supersession_map.json"


def mth(hashes: list[bytes], lo: int = 0, hi: int | None = None) -> bytes:
    if hi is None:
        hi = len(hashes)
    n = hi - lo
    if n == 0:
        return hashlib.sha256(b"").digest()
    if n == 1:
        return hashes[lo]
    k = 1 << ((n - 1).bit_length() - 1)
    return hashlib.sha256(b"\x01" + mth(hashes, lo, lo + k) + mth(hashes, lo + k, hi)).digest()


def path_proof(m: int, hashes: list[bytes], lo: int = 0, hi: int | None = None) -> list[str]:
    if hi is None:
        hi = len(hashes)
    n = hi - lo
    if n == 1:
        return []
    k = 1 << ((n - 1).bit_length() - 1)
    if m < k:
        return path_proof(m, hashes, lo, lo + k) + [mth(hashes, lo + k, hi).hex()]
    return path_proof(m - k, hashes, lo + k, hi) + [mth(hashes, lo, lo + k).hex()]


def load_hashes() -> list[bytes]:
    out = []
    with ENTRIES.open(encoding="utf-8") as fh:
        for line in fh:
            if line.strip():
                out.append(bytes.fromhex(json.loads(line)["leaf_hash"]))
    return out


def get_sth() -> dict:
    return json.loads(STH.read_text(encoding="utf-8"))


def get_entries(start: int = 0, count: int = 1) -> list[dict]:
    rows = []
    with ENTRIES.open(encoding="utf-8") as fh:
        for i, line in enumerate(fh):
            if i < start:
                continue
            if len(rows) >= count:
                break
            if line.strip():
                rows.append(json.loads(line))
    return rows


def inclusion_proof(index: int) -> dict:
    hashes = load_hashes()
    sth = get_sth()
    proof = path_proof(index, hashes)
    return {
        "leaf_index": index,
        "tree_size": sth["tree_size"],
        "leaf_hash": hashes[index].hex(),
        "audit_path": proof,
        "sha256_root_hash": sth["sha256_root_hash"],
    }


def consistency_proof(old_size: int, new_size: int) -> dict:
    hashes = load_hashes()
    sth = get_sth()
    if old_size == new_size == len(hashes):
        return {"old_size": old_size, "new_size": new_size, "consistency_path": []}
    return {
        "old_size": old_size,
        "new_size": new_size,
        "consistency_path": [mth(hashes, 0, min(old_size, len(hashes))).hex()],
        "sha256_root_hash": sth["sha256_root_hash"],
    }


def currency_proof(receipt_id: str) -> dict:
    sth = get_sth()
    census = json.loads(CENSUS.read_text(encoding="utf-8"))
    counts = json.loads(MAP.read_text(encoding="utf-8")) if MAP.is_file() else {}
    v1 = None
    supers = []
    with ENTRIES.open(encoding="utf-8") as fh:
        for line in fh:
            if not line.strip():
                continue
            row = json.loads(line)
            if row.get("leaf_type") == "receipt-v1" and row.get("receipt_id") == receipt_id:
                v1 = row
            if row.get("leaf_type") == "receipt-supersede-v1" and (
                row.get("prior_receipt_id") == receipt_id or row.get("receipt_id") == receipt_id
            ):
                supers.append(row)
    hashes = load_hashes()
    v1_proof = inclusion_proof(v1["i"]) if v1 else None
    pkg = []
    for s in supers:
        pkg.append({"leaf": s, "inclusion": inclusion_proof(s["i"])})
    return {
        "signed_head": {
            "tree_size": sth["tree_size"],
            "sha256_root_hash": sth["sha256_root_hash"],
            "reissue_census": sth.get("reissue_census") or census.get("census"),
            "supersession_counts_sha256": sth.get("supersession_counts_sha256"),
            "signature": sth.get("signature"),
            "signing_key_id": sth.get("signing_key_id"),
        },
        "receipt_v1_inclusion": v1_proof,
        "supersession_package": pkg,
        "supersession_count": counts.get(receipt_id, 0),
        "note": "map-digest recompute is necessary and insufficient under a sole signer",
    }


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: receipt_log.py sth|entries|inclusion-proof|currency-proof|consistency-proof")
        return 2
    cmd = sys.argv[1]
    if cmd in ("sth", "get-STH"):
        print(json.dumps(get_sth(), indent=1))
        return 0
    if cmd in ("entries", "get-entries"):
        start = int(sys.argv[2]) if len(sys.argv) > 2 else 0
        count = int(sys.argv[3]) if len(sys.argv) > 3 else 1
        print(json.dumps(get_entries(start, count)))
        return 0
    if cmd in ("inclusion-proof", "get-inclusion-proof"):
        print(json.dumps(inclusion_proof(int(sys.argv[2]))))
        return 0
    if cmd in ("currency-proof", "get-currency-proof"):
        print(json.dumps(currency_proof(sys.argv[2])))
        return 0
    if cmd in ("consistency-proof", "get-consistency-proof"):
        print(json.dumps(consistency_proof(int(sys.argv[2]), int(sys.argv[3]))))
        return 0
    print("unknown")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
