#!/usr/bin/env python3
"""Anchor-proof counter.

Counts wallet transactions whose decoded memo type is one of the eight
included types. Every other observed type is a named bucket and is never
included. no_memo and undecodable_memo are leftover buckets. STYX memo
types are a separate population.

Inputs: wallet, endpoint. Optional --fixture of account_tx pages so plants
need no network. Writes a JSON run artifact of the banked section-4 shape.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
import urllib.error
import urllib.request
from collections import Counter
from pathlib import Path

TOOL_VERSION = "1.0.0"

INCLUDED_TYPES = (
    "sentinel/evidence-anchor/v1",
    "sentinel/graph-anchor/v1",
    "sentinel/gatekeeper",
    "smelt/governance",
    "sentinel/trust-anchor/v1",
    "smelt/wave-provenance/v1",
    "sentinel/receipt-key/v1",
    "LatticeProof",
)

LEFTOVER_TYPES = ("no_memo", "undecodable_memo")
MORE_THAN_ONE = "more_than_one_memo_type"

STYX_TYPES = frozenset(
    {
        "text/styx-message",
        "text/styx-cmdlog",
        "text/styx-handshake",
        "text/styx-oath",
        "text/styx-rekey",
    }
)

PAGE_LIMIT = 400


def _tool_commit(cwd: Path | None = None) -> str:
    r = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        cwd=str(cwd) if cwd is not None else None,
        capture_output=True,
        text=True,
    )
    if r.returncode != 0 or not r.stdout.strip():
        return "uncommitted"
    return r.stdout.strip()


def decode_memo_type(hex_s: str) -> str | None:
    """Return decoded utf-8 type, or None if undecodable."""
    if not hex_s or not str(hex_s).strip():
        return None
    h = str(hex_s).strip()
    try:
        raw = bytes.fromhex(h)
    except ValueError:
        return None
    try:
        s = raw.decode("utf-8")
    except UnicodeDecodeError:
        return None
    if not s:
        return None
    return s


def tx_body(env: dict) -> dict:
    if not isinstance(env, dict):
        return {}
    body = env.get("tx_json") or env.get("tx") or env
    return body if isinstance(body, dict) else {}


def classify_tx(env: dict) -> tuple[str, str]:
    """Return (population, bucket). population is 'anchor' or 'styx'."""
    body = tx_body(env)
    memos = body.get("Memos") or []
    if not memos:
        return "anchor", "no_memo"
    types: list[str] = []
    for wrap in memos:
        if not isinstance(wrap, dict):
            return "anchor", "undecodable_memo"
        memo = wrap.get("Memo") or wrap
        if not isinstance(memo, dict):
            return "anchor", "undecodable_memo"
        decoded = decode_memo_type(str(memo.get("MemoType") or ""))
        if decoded is None:
            return "anchor", "undecodable_memo"
        types.append(decoded)
    uniq = list(dict.fromkeys(types))
    if len(uniq) > 1:
        return "anchor", MORE_THAN_ONE
    t = uniq[0]
    if t in STYX_TYPES:
        return "styx", t
    return "anchor", t


def empty_counts() -> dict[str, int]:
    out = {k: 0 for k in INCLUDED_TYPES}
    for k in LEFTOVER_TYPES:
        out[k] = 0
    return out


def included_total(counts: dict[str, int]) -> int:
    return sum(counts.get(k, 0) for k in INCLUDED_TYPES)


def build_artifact(
    *,
    wallet: str,
    endpoint: str,
    n_pages: int,
    n_transactions: int,
    counts: dict[str, int],
    styx_counts: dict[str, int],
    elapsed_s: float,
    tool_commit: str,
) -> dict:
    sum_anchor = sum(counts.values())
    sum_styx = sum(styx_counts.values())
    sum_buckets = sum_anchor + sum_styx
    return {
        "wallet": wallet,
        "endpoint": endpoint,
        "n_pages": n_pages,
        "n_transactions": n_transactions,
        "sum_buckets": sum_buckets,
        "conservation_ok": sum_buckets == n_transactions,
        "elapsed_s": elapsed_s,
        "included_n": included_total(counts),
        "counts": dict(sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))),
        "styx_counts": dict(sorted(styx_counts.items(), key=lambda kv: (-kv[1], kv[0]))),
        "included_types": list(INCLUDED_TYPES),
        "tool_version": TOOL_VERSION,
        "tool_commit": tool_commit,
    }


def fetch_pages(wallet: str, endpoint: str, *, limit: int, max_pages: int) -> list[dict]:
    pages: list[dict] = []
    marker = None
    url = endpoint.rstrip("/")
    for _ in range(max_pages):
        params: dict = {
            "account": wallet,
            "ledger_index_min": -1,
            "ledger_index_max": -1,
            "binary": False,
            "limit": limit,
        }
        if marker is not None:
            params["marker"] = marker
        payload = json.dumps({"method": "account_tx", "params": [params]}).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            body = json.loads(resp.read().decode("utf-8"))
        result = body.get("result") if isinstance(body, dict) else None
        if not isinstance(result, dict):
            raise RuntimeError("account_tx result is not an object")
        if result.get("status") == "error":
            raise RuntimeError(result.get("error_message") or result.get("error") or "rpc error")
        pages.append(result)
        marker = result.get("marker")
        if not marker:
            break
    return pages


def load_fixture(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, list):
        return data
    if isinstance(data, dict) and isinstance(data.get("pages"), list):
        return data["pages"]
    raise ValueError("fixture must be a list of pages or an object with pages")


def count_pages(pages: list[dict]) -> tuple[int, dict[str, int], dict[str, int]]:
    counts = empty_counts()
    styx: Counter[str] = Counter()
    n_tx = 0
    for page in pages:
        txs = page.get("transactions") or []
        if not isinstance(txs, list):
            continue
        for env in txs:
            n_tx += 1
            pop, bucket = classify_tx(env if isinstance(env, dict) else {})
            if pop == "styx":
                styx[bucket] += 1
            else:
                counts[bucket] = counts.get(bucket, 0) + 1
    return n_tx, counts, dict(styx)


def run_count(
    *,
    wallet: str,
    endpoint: str,
    fixture: Path | None,
    out: Path | None,
    limit: int,
    max_pages: int,
) -> dict:
    t0 = time.monotonic()
    if fixture is not None:
        pages = load_fixture(fixture)
    else:
        pages = fetch_pages(wallet, endpoint, limit=limit, max_pages=max_pages)
    n_tx, counts, styx = count_pages(pages)
    elapsed = time.monotonic() - t0
    art = build_artifact(
        wallet=wallet,
        endpoint=endpoint,
        n_pages=len(pages),
        n_transactions=n_tx,
        counts=counts,
        styx_counts=styx,
        elapsed_s=elapsed,
        tool_commit=_tool_commit(),
    )
    if out is not None:
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(art, indent=2) + "\n", encoding="utf-8")
    return art


def _hex_type(s: str) -> str:
    return s.encode("utf-8").hex()


def _tx(memo_type: str | None, *, raw_hex: str | None = None) -> dict:
    if memo_type is None and raw_hex is None:
        return {"tx": {"TransactionType": "AccountSet"}}
    hx = raw_hex if raw_hex is not None else _hex_type(memo_type or "")
    return {
        "tx": {
            "TransactionType": "AccountSet",
            "Memos": [{"Memo": {"MemoType": hx}}],
        }
    }


def _pages(*envs: dict) -> list[dict]:
    return [{"transactions": list(envs)}]


def cmd_selftest() -> int:
    failed = 0

    def check(name: str, ok: bool, detail: str = "") -> None:
        nonlocal failed
        if ok:
            print(f"selftest: OK {name}")
        else:
            failed += 1
            print(f"selftest: FAIL {name} {detail}", file=sys.stderr)

    pos = _pages(
        _tx("sentinel/evidence-anchor/v1"),
        _tx("sentinel/evidence-anchor/v1"),
        _tx("LatticeProof"),
    )
    n, counts, styx = count_pages(pos)
    art = build_artifact(
        wallet="rTEST",
        endpoint="fixture://positive",
        n_pages=1,
        n_transactions=n,
        counts=counts,
        styx_counts=styx,
        elapsed_s=0.0,
        tool_commit="selftest",
    )
    check(
        "known_positive",
        n == 3
        and counts["sentinel/evidence-anchor/v1"] == 2
        and counts["LatticeProof"] == 1
        and art["included_n"] == 3
        and art["conservation_ok"]
        and art["sum_buckets"] == 3,
        f"counts={counts} art={art}",
    )

    neg = _pages(
        _tx("text/plain"),
        _tx("text/plain"),
        _tx("text/styx-message"),
        _tx("sentinel/synthetic-not-on-ledger/v0"),
    )
    n, counts, styx = count_pages(neg)
    art = build_artifact(
        wallet="rTEST",
        endpoint="fixture://negative",
        n_pages=1,
        n_transactions=n,
        counts=counts,
        styx_counts=styx,
        elapsed_s=0.0,
        tool_commit="selftest",
    )
    check(
        "known_negative",
        n == 4
        and counts.get("text/plain") == 2
        and counts.get("sentinel/synthetic-not-on-ledger/v0") == 1
        and styx.get("text/styx-message") == 1
        and art["included_n"] == 0
        and "text/styx-message" not in counts
        and art["conservation_ok"],
        f"counts={counts} styx={styx} included={art['included_n']}",
    )

    ctrl = _pages(
        _tx("sentinel/gatekeeper"),
        _tx(None),
        _tx("x", raw_hex="zz"),
        _tx("text/plain"),
        _tx("text/styx-cmdlog"),
        _tx("sentinel/trust-anchor/v1"),
    )
    n, counts, styx = count_pages(ctrl)
    art = build_artifact(
        wallet="rTEST",
        endpoint="fixture://control",
        n_pages=1,
        n_transactions=n,
        counts=counts,
        styx_counts=styx,
        elapsed_s=0.0,
        tool_commit="selftest",
    )
    leftover_sum = counts["no_memo"] + counts["undecodable_memo"]
    check(
        "clean_control",
        n == 6
        and art["sum_buckets"] == 6
        and art["conservation_ok"]
        and art["included_n"] == 2
        and leftover_sum == 2
        and counts.get("text/plain") == 1
        and styx.get("text/styx-cmdlog") == 1
        and leftover_sum + art["included_n"] + counts.get("text/plain", 0)
        + sum(styx.values())
        == n,
        f"counts={counts} styx={styx} art={art}",
    )

    if failed:
        print(f"SELFTEST FAILED ({failed})", file=sys.stderr)
        return 1
    print("SELFTEST PASSED")
    return 0


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Count included memo types on a wallet.")
    p.add_argument("--wallet", default=None)
    p.add_argument("--endpoint", default=None)
    p.add_argument("--out", default=None, help="write JSON run artifact")
    p.add_argument("--fixture", default=None, help="account_tx pages JSON; no network")
    p.add_argument("--limit", type=int, default=PAGE_LIMIT)
    p.add_argument("--max-pages", type=int, default=50)
    p.add_argument("--selftest", action="store_true")
    args = p.parse_args(argv)
    if args.selftest:
        return cmd_selftest()
    if not args.wallet or not args.endpoint:
        print("REFUSED: --wallet and --endpoint are required (or --selftest)", file=sys.stderr)
        return 2
    try:
        art = run_count(
            wallet=args.wallet,
            endpoint=args.endpoint,
            fixture=Path(args.fixture) if args.fixture else None,
            out=Path(args.out) if args.out else None,
            limit=args.limit,
            max_pages=args.max_pages,
        )
    except (OSError, ValueError, RuntimeError, urllib.error.URLError, json.JSONDecodeError) as e:
        print(f"REFUSED: {e}", file=sys.stderr)
        return 1
    json.dump(art, sys.stdout, indent=2)
    sys.stdout.write("\n")
    return 0 if art["conservation_ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
