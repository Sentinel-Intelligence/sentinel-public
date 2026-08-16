#!/usr/bin/env python3
"""D-2026-08-13-GB-XRPL-ANCHOR-STATE measurement.

Read-only XRPL + filesystem enumeration. No writes to ledger or wallet.
All figures measured at write time by this script.
"""
from __future__ import annotations

import hashlib
import json
import re
from collections import Counter
from datetime import datetime, timezone, timedelta
from pathlib import Path

from xrpl.clients import JsonRpcClient
from xrpl.models.requests import AccountTx, Tx

SMELT = Path("/home/toasty/smelt-grok")
LATTICE = Path("/home/toasty/projects/lattice")
OUT = SMELT / "docs/evidence/xrpl_anchor_state_2026-08-13"
OUT.mkdir(parents=True, exist_ok=True)

WALLET = "rLFteU7TV2dP2UNteJPFJE8h8sJjPjqkLV"
RPC = "https://xrplcluster.com"
BASELINE_GRAPH_ANCHORS = 311
EXAMPLE_TX = "A6A862A31B695FCDBC4DACA9B3120181EBF619F81DB63779CE59A9F946537E23"


def sha_file(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def sha_text(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()


def decode_hex(h: str) -> str:
    if not h:
        return ""
    try:
        return bytes.fromhex(h).decode("utf-8", errors="replace")
    except Exception:
        return ""


def rippled_time_to_iso(ripple_time) -> str | None:
    if ripple_time is None:
        return None
    epoch = datetime(2000, 1, 1, tzinfo=timezone.utc)
    return (epoch + timedelta(seconds=int(ripple_time))).isoformat()


def main() -> None:
    measured_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    client = JsonRpcClient(RPC)

    # ── Task 1: mechanism enumeration ──────────────────────────────────────
    mechanism_paths = []
    seen: set[str] = set()
    for root in (LATTICE / "lattice", LATTICE / "scripts", LATTICE / "forge"):
        if not root.exists():
            continue
        for p in root.rglob("*"):
            if not p.is_file() or p.suffix not in {".py", ".sh", ".md"}:
                continue
            if "__pycache__" in p.parts or ".mypy_cache" in p.parts:
                continue
            try:
                text = p.read_text(errors="replace")
            except Exception:
                continue
            needles = []
            for needle in (
                "AccountSet",
                "graph-anchor",
                "trust-anchor",
                "evidence-anchor",
                "MemoType",
                "xrpl_anchor",
                "sentinel/graph-anchor",
            ):
                if needle in text or needle in p.name.lower():
                    needles.append(needle)
            if not needles or str(p) in seen:
                continue
            seen.add(str(p))
            memos = re.findall(r'MEMO_TYPE\s*=\s*["\']([^"\']+)["\']', text)
            memos += re.findall(r"sentinel/[a-z0-9_./-]+", text)
            pl = str(p).lower()
            if "verify" in pl:
                role = "verify"
            elif "poc" in pl or "timestamp" in pl:
                role = "graph_anchor_submit"
            elif "batch" in pl:
                role = "batch_worker"
            elif "shield" in pl:
                role = "shield_or_archive"
            elif "blockchain" in pl:
                role = "evidence_anchor"
            else:
                role = "related"
            mechanism_paths.append(
                {
                    "path": str(p),
                    "bytes": p.stat().st_size,
                    "sha256": sha_file(p),
                    "needles_hit": sorted(set(needles)),
                    "memo_type_literals": sorted(set(memos))[:20],
                    "role_guess": role,
                }
            )
    mechanism_paths.sort(key=lambda x: x["path"])

    # ── Task 3: published recipes ──────────────────────────────────────────
    recipe_a_code = (
        'from xrpl.clients import JsonRpcClient\n'
        'from xrpl.models.requests import AccountTx\n\n'
        'client = JsonRpcClient("https://xrplcluster.com")\n'
        'wallet = "rLFteU7TV2dP2UNteJPFJE8h8sJjPjqkLV"\n'
        'req = AccountTx(account=wallet, limit=400)\n'
        'resp = client.request(req)\n\n'
        'proofs = [\n'
        '    tx for tx in resp.result.get("transactions", [])\n'
        '    if tx.get("tx", {}).get("TransactionType") == "AccountSet"\n'
        '    and tx.get("tx", {}).get("Memos")\n'
        ']\n'
        'print(f"Total provenance anchors found: {len(proofs)}")\n'
    )

    req = AccountTx(account=WALLET, limit=400)
    resp = client.request(req)
    raw = resp.result
    txs = raw.get("transactions", [])
    proofs_a = [
        tx
        for tx in txs
        if tx.get("tx", {}).get("TransactionType") == "AccountSet"
        and tx.get("tx", {}).get("Memos")
    ]
    lines_a = [f"Total provenance anchors found: {len(proofs_a)}"]
    if proofs_a:
        memo_hex = proofs_a[0]["tx"]["Memos"][0]["Memo"].get("MemoData", "")
        lines_a.append(
            "Most recent memo: "
            + bytes.fromhex(memo_hex).decode("utf-8", errors="replace")
        )
    sample_keys = sorted(txs[0].keys()) if txs else []
    n_tx_field = sum(1 for t in txs if "tx" in t)
    n_tx_json = sum(1 for t in txs if "tx_json" in t)
    n_as_either = 0
    for t in txs:
        body = t.get("tx") or t.get("tx_json") or {}
        if body.get("TransactionType") == "AccountSet" and body.get("Memos"):
            n_as_either += 1
    diagnosis = None
    if not proofs_a:
        diagnosis = (
            "Published filter reads envelope['tx'] only. "
            f"On this RPC page: envelopes_with_tx={n_tx_field}, "
            f"envelopes_with_tx_json={n_tx_json}, "
            f"AccountSet+Memos via tx_or_tx_json={n_as_either}. "
            + (
                "Proofs exist under tx_json but not under tx — recipe path miss "
                "(API response shape drift)."
                if n_as_either > 0 and n_tx_field == 0
                else "No AccountSet+Memos on first page under either field."
            )
        )
    recipe_a = {
        "recipe_name": "RFI_v5_Method2_AccountTx_limit400_filter_tx_AccountSet_Memos",
        "source": "forge/nist_rfi/submission/caisi_rfi_response_v5_FINAL.md Method 2",
        "code_sha256": sha_text(recipe_a_code),
        "verbatim_stdout_lines": lines_a,
        "verbatim_stdout": "\n".join(lines_a) + "\n",
        "n_proofs_recipe_filter": len(proofs_a),
        "n_transactions_in_page": len(txs),
        "page_marker_present": "marker" in raw,
        "diagnostics": {
            "sample_tx_envelope_keys": sample_keys,
            "n_envelopes_with_tx_field": n_tx_field,
            "n_envelopes_with_tx_json_field": n_tx_json,
            "n_AccountSet_with_Memos_if_using_tx_or_tx_json": n_as_either,
            "diagnosis_if_zero": diagnosis,
        },
    }

    # Payment first page
    n_pay = 0
    for t in txs:
        body = t.get("tx") or t.get("tx_json") or {}
        if body.get("TransactionType") == "Payment" and body.get("Memos"):
            n_pay += 1
    recipe_payment = {
        "recipe_name": "Payment_plus_Memos_first_page_limit400",
        "note": "07-31 census: first page Payment+Memos = 0; proof stream is AccountSet+Memos",
        "n_found": n_pay,
        "verbatim_stdout": f"Payment+Memos on first page: {n_pay}\n",
    }

    # Alt recipe with tx_json
    proofs_b = []
    for tx_env in txs:
        tx = tx_env.get("tx_json", tx_env.get("tx", {}))
        if tx.get("TransactionType") == "AccountSet" and tx.get("Memos"):
            proofs_b.append(
                {
                    "hash": tx.get("hash") or tx_env.get("hash"),
                    "date": tx_env.get(
                        "close_time_iso", tx_env.get("date", "unknown")
                    ),
                }
            )
    lines_b = [f"Provenance anchors found: {len(proofs_b)}"]
    if proofs_b:
        lines_b.append(
            f"Earliest: {proofs_b[-1]['date']} — {proofs_b[-1]['hash']}"
        )
        lines_b.append(
            f"Latest:   {proofs_b[0]['date']} — {proofs_b[0]['hash']}"
        )
        lines_b.append("Sample hashes (most recent 3):")
        for p in proofs_b[:3]:
            lines_b.append(f"  {p['hash']}")
    recipe_b = {
        "recipe_name": "RFI_v5_verify_block_tx_json_or_tx_AccountSet_Memos_limit400",
        "source": "caisi_rfi_response_v5_FINAL.md verification block ~line 1012",
        "verbatim_stdout_lines": lines_b,
        "verbatim_stdout": "\n".join(lines_b) + "\n",
        "n_proofs": len(proofs_b),
        "latest": proofs_b[0] if proofs_b else None,
        "earliest_on_page": proofs_b[-1] if proofs_b else None,
    }

    print(
        f"recipe_a n={recipe_a['n_proofs_recipe_filter']} "
        f"recipe_b n={recipe_b['n_proofs']} payment={n_pay}",
        flush=True,
    )

    # ── Task 2: full pagination ────────────────────────────────────────────
    marker = None
    pages = 0
    memo_type_counts: Counter = Counter()
    accountset_with_memo = 0
    payment_with_memo = 0
    graph_anchors = []
    all_memo_txs = []

    while True:
        kwargs: dict = {"account": WALLET, "limit": 400}
        if marker is not None:
            kwargs["marker"] = marker
        result = client.request(AccountTx(**kwargs)).result
        page_txs = result.get("transactions", [])
        pages += 1
        for env in page_txs:
            body = env.get("tx_json") or env.get("tx") or {}
            ttype = body.get("TransactionType")
            memos = body.get("Memos") or []
            close_iso = env.get("close_time_iso")
            if close_iso is None and env.get("date") is not None:
                close_iso = rippled_time_to_iso(env.get("date"))
            thash = body.get("hash") or env.get("hash")
            if ttype == "Payment" and memos:
                payment_with_memo += 1
            if ttype == "AccountSet" and memos:
                accountset_with_memo += 1
                for mwrap in memos:
                    memo = mwrap.get("Memo") or mwrap
                    mt = decode_hex(memo.get("MemoType", ""))
                    md = decode_hex(memo.get("MemoData", ""))
                    memo_type_counts[mt or "EMPTY_OR_UNDECODED"] += 1
                    rec = {
                        "tx_hash": thash,
                        "close_time_iso": close_iso,
                        "memo_type": mt,
                        "memo_data_prefix": md[:200],
                    }
                    all_memo_txs.append(rec)
                    if mt == "sentinel/graph-anchor/v1":
                        graph_anchors.append(rec)
        marker = result.get("marker")
        print(
            f"  page {pages} txs={len(page_txs)} marker={'yes' if marker else 'no'}",
            flush=True,
        )
        if not marker or pages > 50:
            break

    dated = [r for r in all_memo_txs if r.get("close_time_iso")]
    latest_any = max(dated, key=lambda r: r["close_time_iso"]) if dated else None
    oldest_any = min(dated, key=lambda r: r["close_time_iso"]) if dated else None
    graph_dated = [r for r in graph_anchors if r.get("close_time_iso")]
    latest_graph = (
        max(graph_dated, key=lambda r: r["close_time_iso"]) if graph_dated else None
    )
    oldest_graph = (
        min(graph_dated, key=lambda r: r["close_time_iso"]) if graph_dated else None
    )

    idle = None
    if latest_any and latest_any.get("close_time_iso"):
        latest_dt = datetime.fromisoformat(
            latest_any["close_time_iso"].replace("Z", "+00:00")
        )
        if latest_dt.tzinfo is None:
            latest_dt = latest_dt.replace(tzinfo=timezone.utc)
        delta = datetime.now(timezone.utc) - latest_dt
        idle = {
            "most_recent_anchor_utc": latest_any["close_time_iso"],
            "measured_at_utc": measured_at,
            "idle_days": round(delta.total_seconds() / 86400.0, 3),
            "idle_human": str(delta),
            "most_recent_tx_hash": latest_any.get("tx_hash"),
            "most_recent_memo_type": latest_any.get("memo_type"),
        }

    n_graph = len(graph_anchors)

    # Example TX
    ex_r = client.request(Tx(transaction=EXAMPLE_TX)).result
    ex_tx = ex_r.get("tx_json") or ex_r.get("tx") or ex_r
    ex_meta = ex_r.get("meta") or {}
    example_record = {
        "tx_hash": EXAMPLE_TX,
        "validated": ex_r.get("validated"),
        "ledger_index": ex_r.get("ledger_index") or ex_tx.get("ledger_index"),
        "transaction_type": ex_tx.get("TransactionType"),
        "tx_result": (
            ex_meta.get("TransactionResult") if isinstance(ex_meta, dict) else None
        ),
        "memos": [],
    }
    for mwrap in ex_tx.get("Memos") or []:
        memo = mwrap.get("Memo") or mwrap
        example_record["memos"].append(
            {
                "memo_type": decode_hex(memo.get("MemoType", "")),
                "memo_data_prefix": decode_hex(memo.get("MemoData", ""))[:300],
            }
        )

    # ── Task 4: public claims ──────────────────────────────────────────────
    public_files = [
        Path("/home/toasty/projects/sentinel-public/README.md"),
        Path("/home/toasty/projects/sentinel-public/docs/methodology.md"),
        Path("/home/toasty/projects/sentinel-public/docs/data_sources.md"),
        LATTICE / "docs/gap_tgn_competitive_analysis.md",
        LATTICE / "forge/nist_rfi/submission/caisi_rfi_response_v5_FINAL.md",
        LATTICE / "nist/caisi_rfi_response_v3.md",
        LATTICE / "nist/caisi_rfi_response.md",
        LATTICE / "nist/nccoe_agent_identity_response.md",
    ]
    claims = []
    seen_quotes: set[tuple[str, str]] = set()
    for fp in public_files:
        if not fp.is_file():
            continue
        for i, line in enumerate(fp.read_text(errors="replace").splitlines(), 1):
            if not re.search(r"XRPL|anchor|blockchain|provenan|proofs?", line, re.I):
                continue
            if len(line.strip()) < 40:
                continue
            key = (str(fp), line.strip()[:120])
            if key in seen_quotes:
                continue
            seen_quotes.add(key)
            if re.search(r"\b[Ee]very\b", line) and re.search(
                r"anchor|XRPL|blockchain", line, re.I
            ):
                cat = "universal_every"
            elif re.search(r"\b\d{2,4}\b.*proof", line, re.I) or re.search(
                r"proofs?\b.*\b\d{2,4}\b", line, re.I
            ):
                cat = "proof_count"
            elif "rLFteU7" in line:
                cat = "wallet_pointer"
            elif re.search(r"verif", line, re.I):
                cat = "verification_invite"
            else:
                cat = "xrpl_general"
            claims.append(
                {
                    "location": str(fp),
                    "line": i,
                    "quote": line.strip()[:500],
                    "category": cat,
                }
            )

    for c in claims:
        q = c["quote"]
        cat = c["category"]
        if cat == "universal_every":
            c["verdict"] = "OVERSTATES"
            c["basis"] = (
                f"Measured AccountSet+Memo={accountset_with_memo} "
                f"({n_graph} graph-anchor/v1); not one seal per node/edge/score."
            )
        elif cat == "proof_count":
            m = re.search(r"\b(\d{2,4})\b", q)
            claimed = int(m.group(1)) if m else None
            if claimed is None:
                c["verdict"] = "UNVERIFIABLE"
                c["basis"] = "No integer proof count extracted."
            elif claimed in (239, 240, 294, 220, 295):
                c["verdict"] = "OVERSTATES" if re.search(r"\bevery\b", q, re.I) else "UNVERIFIABLE"
                c["basis"] = (
                    f"Self-report {claimed}; live graph-anchor/v1={n_graph}, "
                    f"AccountSet+Memo={accountset_with_memo}. Does not match a single "
                    "MemoType class exactly (e.g. 294≠311)."
                )
            elif abs(claimed - n_graph) <= 5 or abs(claimed - accountset_with_memo) <= 20:
                c["verdict"] = "HOLDS"
                c["basis"] = (
                    f"Near live graph-anchor={n_graph} or AccountSet+Memo={accountset_with_memo}."
                )
            else:
                c["verdict"] = "UNVERIFIABLE"
                c["basis"] = (
                    f"Claimed {claimed}; live graph-anchor={n_graph}, "
                    f"AccountSet+Memo={accountset_with_memo}."
                )
        elif cat == "wallet_pointer":
            c["verdict"] = "HOLDS"
            c["basis"] = f"Wallet {WALLET} is the measured account."
        elif cat == "verification_invite":
            if recipe_a["n_proofs_recipe_filter"] == 0:
                c["verdict"] = "OVERSTATES"
                c["basis"] = (
                    "Published Method 2 recipe returns 0 on current RPC response shape: "
                    + str(diagnosis)
                )
            else:
                c["verdict"] = "HOLDS"
                c["basis"] = (
                    f"Method 2 returns {recipe_a['n_proofs_recipe_filter']} on first page."
                )
        else:
            c["verdict"] = "UNVERIFIABLE"
            c["basis"] = "General XRPL language; not a countable mechanism claim."

    # ── Task 5: measurement-chain coverage ─────────────────────────────────
    arc_candidates = []
    for root, label in (
        (SMELT / "docs/review", "review"),
        (SMELT / "docs/dispatch", "dispatch"),
    ):
        if not root.exists():
            continue
        for p in sorted(root.glob("*")):
            if not p.is_file():
                continue
            name = p.name.lower()
            if any(
                k in name
                for k in (
                    "oracle",
                    "gate",
                    "hub_disposition",
                    "hub_record",
                    "close_report",
                    "multimodel",
                    "schema_ground",
                    "ref_repair",
                    "cost_profile",
                    "router",
                    "c4",
                    "baseline",
                    "eval",
                )
            ):
                arc_candidates.append(
                    {
                        "path": str(p.relative_to(SMELT)),
                        "bytes": p.stat().st_size,
                        "sha256": sha_file(p),
                        "class": label,
                    }
                )

    needle_hits: Counter = Counter()
    needles = [
        "oracle",
        "gate_v1",
        "close_report",
        "hub_disposition",
        "measurement",
        "D-2026-08",
        "schema_grounding",
        "ref_repair",
        "cost_profile",
        "router_design",
    ]
    for rec in all_memo_txs:
        md = (rec.get("memo_data_prefix") or "").lower()
        for n in needles:
            if n.lower() in md:
                needle_hits[n] += 1

    chain_keys = (
        "close_report",
        "hub_disposition",
        "gate_v1",
        "D-2026-08",
        "ref_repair",
        "cost_profile",
        "router_design",
        "schema_grounding",
    )
    chain_hits = sum(needle_hits.get(k, 0) for k in chain_keys)

    coverage = {
        "measurement_chain_amendment": (
            "Hub rulings, dispositions, gate instrument versions, and certified "
            "close reports from the Oracle measurement arc join the anchoring set "
            "(hub_record_provenance_ingestion_lanes_2026-08-13). Implementation not "
            "authorized by this dispatch."
        ),
        "arc_artifact_files_enumerated": len(arc_candidates),
        "arc_artifact_sample": arc_candidates[:50],
        "memo_payload_keyword_hits_in_prefix": dict(needle_hits),
        "n_memos_scanned": len(all_memo_txs),
        "measurement_chain_keyword_hits": chain_hits,
        "anchored_today_estimate": (
            "near zero for Oracle-arc measurement artifacts: no memo_data_prefix "
            "matched close_report / hub_disposition / gate_v1 / D-2026-08 "
            "measurement-chain identifiers in scanned prefixes."
            if chain_hits == 0
            else "some keyword hits present — see memo_payload_keyword_hits_in_prefix"
        ),
        "graph_anchor_classes_present": sorted(memo_type_counts.keys()),
    }

    idle_plain = (
        f"Anchoring idle approximately {idle['idle_days']} days "
        f"(most recent AccountSet+Memo {idle['most_recent_anchor_utc']}, "
        f"type {idle['most_recent_memo_type']})."
        if idle and "idle_days" in idle
        else "Could not compute idle interval."
    )

    packet = {
        "dispatch": "D-2026-08-13-GB-XRPL-ANCHOR-STATE",
        "version": "1.0.0",
        "measured_at_utc": measured_at,
        "mode": "READ_ONLY",
        "wallet": WALLET,
        "rpc": RPC,
        "baseline_07_31": {
            "graph_anchor_v1": BASELINE_GRAPH_ANCHORS,
            "accountset_with_memo": 3468,
            "trust_anchor_v1": 3105,
            "source": (
                "docs/evidence/outward_claim_remediation_2026-07-31/"
                "xrpl_memo_type_breakdown.json"
            ),
        },
        "task1_mechanism": {
            "wallet_address": WALLET,
            "wallet_source": "public RFI/README/explorer links; measured account_tx subject",
            "script_paths_discovered": mechanism_paths,
            "n_paths": len(mechanism_paths),
            "artifact_classes_from_memo_types_live": dict(memo_type_counts),
        },
        "task2_population": {
            "pages_paginated": pages,
            "accountset_with_memo": accountset_with_memo,
            "payment_with_memo_full": payment_with_memo,
            "memo_type_counts": dict(memo_type_counts.most_common()),
            "graph_anchor_v1_count": n_graph,
            "delta_graph_anchor_vs_311_baseline": n_graph - BASELINE_GRAPH_ANCHORS,
            "latest_any_accountset_memo": latest_any,
            "oldest_any_accountset_memo": oldest_any,
            "latest_graph_anchor": latest_graph,
            "oldest_graph_anchor": oldest_graph,
            "idle": idle,
            "idle_plain": idle_plain,
        },
        "task3_published_recipes": {
            "method2_exact_tx_field": recipe_a,
            "method2_alt_tx_json_or_tx": recipe_b,
            "payment_plus_memos_first_page": recipe_payment,
            "stands_zero": recipe_a["n_proofs_recipe_filter"] == 0,
            "diagnosis": diagnosis,
        },
        "task3_example_tx": example_record,
        "task4_public_claims_delta": claims,
        "task4_verdict_counts": dict(Counter(c["verdict"] for c in claims)),
        "task5_measurement_chain_coverage": coverage,
        "ruling_input_note": (
            "Ruling input only. No public-copy edits, no XRPL writes, no wallet ops. "
            "Every public-copy change arising from this measurement is operator-class."
        ),
    }

    (OUT / "xrpl_anchor_state_measurement_v1_0_0.json").write_text(
        json.dumps(packet, indent=2) + "\n"
    )
    (OUT / "published_recipe_stdout.txt").write_text(
        "=== RECIPE Method2 exact (tx field) ===\n"
        + recipe_a["verbatim_stdout"]
        + "\n=== RECIPE Method2 alt (tx_json or tx) ===\n"
        + recipe_b["verbatim_stdout"]
        + "\n=== RECIPE Payment+Memos first page ===\n"
        + recipe_payment["verbatim_stdout"]
    )
    (OUT / "memo_type_counts_v1_0_0.json").write_text(
        json.dumps(
            {
                "measured_at_utc": measured_at,
                "wallet": WALLET,
                "accountset_with_memo": accountset_with_memo,
                "graph_anchor_v1": n_graph,
                "memo_type_counts": dict(memo_type_counts.most_common()),
                "baseline_graph_anchor_v1": BASELINE_GRAPH_ANCHORS,
            },
            indent=2,
        )
        + "\n"
    )
    (OUT / "public_claims_delta_v1_0_0.json").write_text(
        json.dumps({"measured_at_utc": measured_at, "claims": claims}, indent=2) + "\n"
    )
    (OUT / "mechanism_paths_v1_0_0.json").write_text(
        json.dumps(
            {"measured_at_utc": measured_at, "paths": mechanism_paths}, indent=2
        )
        + "\n"
    )

    lines = []
    for p in sorted(OUT.iterdir()):
        if p.is_file() and p.name != "SHA256SUMS.txt":
            lines.append(f"{sha_file(p)}  {p.name}")
    (OUT / "SHA256SUMS.txt").write_text("\n".join(lines) + "\n")

    print(
        json.dumps(
            {
                "measured_at_utc": measured_at,
                "accountset_with_memo": accountset_with_memo,
                "graph_anchor_v1": n_graph,
                "delta_vs_311": n_graph - BASELINE_GRAPH_ANCHORS,
                "recipe_a_n": recipe_a["n_proofs_recipe_filter"],
                "recipe_b_n": recipe_b["n_proofs"],
                "payment_first_page": recipe_payment["n_found"],
                "idle_days": (idle or {}).get("idle_days"),
                "latest": latest_any,
                "claims": len(claims),
                "verdicts": dict(Counter(c["verdict"] for c in claims)),
                "measurement_sha": sha_file(
                    OUT / "xrpl_anchor_state_measurement_v1_0_0.json"
                ),
            },
            indent=2,
        ),
        flush=True,
    )


if __name__ == "__main__":
    main()
