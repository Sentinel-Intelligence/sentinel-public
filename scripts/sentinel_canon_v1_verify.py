#!/usr/bin/env python3
"""sentinel-canon-v1 reference verifier (public pilot field-test candidate).

Dispatch: D-2026-08-16-GB-CANON-VERIFIER

Canonicalization (sentinel-canon-v1), per hub disposition issuance design:
  - UTF-8 encoding
  - object keys sorted by Unicode code point
  - separators comma and colon with no insignificant whitespace
  - JSON null preserved (distinct from key absence)
  - numbers as JSON integers only (no float, no exponent, no leading zeros,
    no sign on zero); float inputs refuse

receipt_id: "receipt-" + first 16 lowercase hex of sha256 over the canonical
payload with receipt_id and signature excluded.

Signing bytes: canonical payload with signature excluded (receipt_id included),
matching banked OC-7 answer/refusal_receipt_canonical_*. files.

Signature: Ed25519 over signing bytes. Key pinning is enforced at two levels.
First, the verifier embeds the announced key material in PINNED_KEYS (a
module-level constant mapping key_id to public_key_hex). Any record whose
public_key_hex is not a pinned value is refused, as is any record whose
key_id and public_key_hex do not belong to the same pinned entry. Key
rotation requires changing this file and redeploying it.
Second, the receipt must declare signing_key_id as a non-empty string and
the public key record must carry key_id as a non-empty string; verification
refuses if either is absent. When both are present they must match; a
mismatch is refused before signature verification runs. Default public key
record: docs/evidence/anchor_resume_2026-08-13/receipt_key_public_v1_0_1.json

Dependency: Python 3 stdlib + cryptography (Ed25519). Proven with cryptography
version printed on --version / verify output.

Usage:
  python3 scripts/sentinel_canon_v1_verify.py verify RECEIPT.json \\
      [--public-key PATH] [--expect-canonical-sha256 HEX] [--pin-file PATH]
  python3 scripts/sentinel_canon_v1_verify.py vector VECTOR.json
  python3 scripts/sentinel_canon_v1_verify.py dump-canonical RECEIPT.json
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path
from typing import Any

try:
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
    from cryptography.exceptions import InvalidSignature
    import cryptography

    CRYPTO_VERSION = cryptography.__version__
except ImportError as e:  # pragma: no cover
    print(f"FATAL: cryptography required: {e}", file=sys.stderr)
    sys.exit(2)

CANON_VERSION = "sentinel-canon-v1"
# No repository-relative default key path (D-2026-08-22-CC-VERIFIER-PIN-API-KEY,
# cold-verify close ruling 3): a verifier that needs the repository to find its
# own trust anchor is not the offline verifier the format claims. --public-key
# is optional; when absent, the receipt's own signing_key_id is resolved
# directly against PINNED_KEYS below -- see resolve_public_key().

# Announced key material pinned in this file so it is the single trust anchor.
# Rotation: add a new entry. Do not edit existing entries while receipts
# signed under the old key may still be verified. Removal of an entry
# disables verification of receipts issued under that key.
# Key rotation requires changing this file and redeploying it.
# Hex values read from: docs/evidence/anchor_resume_2026-08-13/receipt_key_public_v1_0_1.json
# and docs/evidence/D-2026-08-22-GB-API-KEY-ANNOUNCEMENT/receipt_api_answer_public_v1_0_1.json
PINNED_KEYS: dict[str, str] = {
    "receipt-ed25519-3a89049da148a9d4": "944a0bff9fa8cd3f6acd2d657a3f3adb1456d79b03f000405e0d4340d9afbe29",
    # API-answer key, announced on-ledger 2026-08-22 (announcement_transaction_hash
    # 8CAD54B178335E0ADCBA1AD3319CC776499EFA7233125FE6BCAED16683FB1A5A,
    # D-2026-08-22-GB-API-KEY-ANNOUNCEMENT). Existing entry above is untouched.
    "receipt-ed25519-api-answer-97713e35aaf50dbb": "b824872881ce1a124ca8d4b748a3b0b09e4d3e9fc30a79d72c80c1d20799e2ee",
}


class CanonError(ValueError):
    """Canonicalization or verification input error."""


def _reject_floats(obj: Any, path: str = "$") -> None:
    if isinstance(obj, float):
        raise CanonError(
            f"sentinel-canon-v1 refuses float at {path}: {obj!r} "
            "(integers only; never round)"
        )
    if isinstance(obj, dict):
        for k, v in obj.items():
            _reject_floats(v, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            _reject_floats(v, f"{path}[{i}]")


def canonicalize(obj: Any) -> bytes:
    """Return sentinel-canon-v1 UTF-8 bytes for a JSON-compatible object."""
    _reject_floats(obj)
    return json.dumps(
        obj,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
        allow_nan=False,
    ).encode("utf-8")


def payload_for_receipt_id(receipt: dict) -> dict:
    return {k: v for k, v in receipt.items() if k not in ("receipt_id", "signature")}


def payload_for_signing(receipt: dict) -> dict:
    return {k: v for k, v in receipt.items() if k != "signature"}


def compute_receipt_id(receipt: dict) -> str:
    digest = hashlib.sha256(canonicalize(payload_for_receipt_id(receipt))).hexdigest()
    return "receipt-" + digest[:16]


def cited_cypher_digest(cited_cypher: Any) -> str:
    """sha256 hex over canonical JSON of compose cited_cypher.

    Rule: json.dumps(..., ensure_ascii=False, sort_keys=True,
    separators=(",", ":"), allow_nan=False).encode("utf-8").
    """
    return hashlib.sha256(canonicalize(cited_cypher)).hexdigest()


def _is_int(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool)


def pin_line_check(receipt: dict, pin_path: Path) -> dict[str, Any]:
    """Require and recompute named pin-receipt fields.

    Applies when certification_artifact_anchor_reference is not-anchored
    and certification_artifact_identity equals the sha256 of pin_path.
    Shown and other non-not-anchored receipts do not require the fields.
    """
    out: dict[str, Any] = {"ok": False, "check": "pin_line"}
    if not isinstance(receipt, dict):
        out["reason"] = "receipt is not a JSON object"
        return out
    anchor = receipt.get("certification_artifact_anchor_reference")
    if anchor != "not-anchored":
        out["ok"] = True
        out["reason"] = "pin_line not applicable"
        return out
    if not pin_path.is_file():
        out["reason"] = "pin file missing"
        return out
    pin_digest = hashlib.sha256(pin_path.read_bytes()).hexdigest()
    identity = receipt.get("certification_artifact_identity")
    if identity != pin_digest:
        out["reason"] = "pin file digest mismatch"
        return out
    cy = receipt.get("cited_cypher_sha256")
    mc = receipt.get("match_count")
    if not isinstance(cy, str) or not cy:
        out["reason"] = "cited_cypher_sha256 missing or empty"
        return out
    if not _is_int(mc):
        out["reason"] = "match_count not integer"
        return out
    question = receipt.get("question_hash")
    found = None
    for raw in pin_path.read_text(encoding="utf-8").splitlines():
        if not raw.strip():
            continue
        rec = json.loads(raw)
        if rec.get("question") == question:
            found = rec
            break
    if found is None:
        out["reason"] = "pin line missing for question_hash"
        return out
    want_cy = cited_cypher_digest(found.get("cited_cypher"))
    want_mc = found.get("match_count")
    if not _is_int(want_mc):
        out["reason"] = "pin line match_count not integer"
        return out
    if cy != want_cy:
        out["reason"] = "cited_cypher_sha256 mismatch"
        return out
    if mc != want_mc:
        out["reason"] = "match_count mismatch"
        return out
    out["ok"] = True
    out["reason"] = "pin_line PASS"
    return out



def payload_for_commitment_signing(commitment: dict) -> dict:
    return {k: v for k, v in commitment.items() if k != "signature"}


def membership_check(
    receipt: dict,
    commitment: dict,
    pin_reference: str,
    *,
    pub: "Ed25519PublicKey | None" = None,
) -> dict[str, Any]:
    """Set-membership against a set commitment. Distinct from per-receipt verify."""
    out: dict[str, Any] = {"ok": False, "check": "membership"}
    if not isinstance(commitment, dict):
        out["reason"] = "commitment is not an object"
        return out
    sig = commitment.get("signature")
    if not isinstance(sig, str) or not sig:
        out["reason"] = "signature missing"
        return out
    if sig == "unsigned":
        out["reason"] = "unsigned"
        return out
    if pub is None:
        out["reason"] = "commitment public key required"
        return out
    try:
        sig_bytes = bytes.fromhex(sig)
    except ValueError:
        out["reason"] = "signature is not valid lowercase hex"
        return out
    try:
        pub.verify(sig_bytes, canonicalize(payload_for_commitment_signing(commitment)))
    except InvalidSignature:
        out["reason"] = "Ed25519 signature invalid under announced public key"
        return out
    size = commitment.get("set_size")
    ids = commitment.get("receipt_ids")
    if size != 12 or not isinstance(ids, list) or len(ids) != 12:
        out["reason"] = "set size is not twelve"
        return out
    if commitment.get("pin_reference") != pin_reference:
        out["reason"] = "pin-reference mismatch"
        return out
    rid = receipt.get("receipt_id") if isinstance(receipt, dict) else None
    if not isinstance(rid, str) or not rid:
        out["reason"] = "candidate receipt_id missing"
        return out
    if rid not in ids:
        out["reason"] = "receipt_id not in set"
        return out
    out["ok"] = True
    out["reason"] = "membership PASS"
    return out


def load_public_key(record_path: Path) -> tuple[Ed25519PublicKey, dict]:
    rec = json.loads(record_path.read_text(encoding="utf-8"))
    hex_key = rec.get("public_key_hex")
    if not hex_key or not isinstance(hex_key, str):
        raise CanonError(f"public key record missing public_key_hex: {record_path}")
    pub = Ed25519PublicKey.from_public_bytes(bytes.fromhex(hex_key))
    return pub, rec


def resolve_public_key(
    receipt: dict, public_key_record: "Path | None"
) -> "tuple[Ed25519PublicKey | None, dict | None, str | None]":
    """Resolve the verifying key. Returns (pub, pub_rec, error_reason).

    When public_key_record is given, behavior is unchanged from before this
    dispatch: the record is read from disk and cross-checked against
    PINNED_KEYS by the caller.

    When public_key_record is None (no --public-key), no path relative to
    the repository -- or anywhere else -- is read. The key is resolved
    directly from PINNED_KEYS using the receipt's own signing_key_id: the
    receipt names which announced key it claims, and the trust anchor is
    the same PINNED_KEYS table either way, so no external record file is
    needed to know that name maps to a pinned hex.  pub_rec is synthesized
    as {key_id, public_key_hex} so the rest of verify_receipt's pinning
    checks below run unchanged over either path.
    """
    if public_key_record is not None:
        pub, pub_rec = load_public_key(public_key_record)
        return pub, pub_rec, None

    key_id = receipt.get("signing_key_id")
    if not key_id or not isinstance(key_id, str):
        return None, None, (
            "no --public-key supplied and receipt does not pin its signing "
            "key: signing_key_id field is absent or empty"
        )
    hex_key = PINNED_KEYS.get(key_id)
    if hex_key is None:
        return None, None, (
            f"no --public-key supplied and signing_key_id {key_id!r} is not "
            "a pinned announced key"
        )
    pub = Ed25519PublicKey.from_public_bytes(bytes.fromhex(hex_key))
    pub_rec = {"key_id": key_id, "public_key_hex": hex_key}
    return pub, pub_rec, None


def verify_receipt(
    receipt: dict,
    *,
    public_key_record: "Path | None" = None,
    expect_canonical_sha256: str | None = None,
    pin_file: "Path | None" = None,
    set_commitment: "Path | None" = None,
    pin_reference: str | None = None,
    commitment_public_key: "Path | None" = None,
) -> dict[str, Any]:
    """Verify receipt_id and Ed25519 signature with mandatory key pinning.

    public_key_record is optional. When given, an explicit record file is
    read and cross-checked against PINNED_KEYS (unchanged from before this
    dispatch). When omitted, the key is resolved directly from PINNED_KEYS
    by the receipt's own signing_key_id -- see resolve_public_key(). Either
    way no path relative to the repository is constructed.

    Two levels of pinning are enforced. First, the record's public_key_hex must
    appear in PINNED_KEYS and its key_id must map to that same hex in PINNED_KEYS;
    any record whose key material is not a pinned announced key is refused before
    signature verification. Key rotation requires changing PINNED_KEYS in this
    file.

    Second, the receipt must declare signing_key_id as a non-empty string. The
    public key record must carry key_id as a non-empty string. Both must match.
    Any absence or mismatch is refused before signature verification runs.

    On failure sets ok=False and reason; never raises for crypto mismatch
    (raises only on structural/IO errors that prevent running the check).
    """
    result: dict[str, Any] = {
        "ok": False,
        "canonicalization_version": CANON_VERSION,
        "cryptography_version": CRYPTO_VERSION,
        "public_key_record": (
            str(public_key_record)
            if public_key_record is not None
            else "PINNED_KEYS (no --public-key supplied)"
        ),
    }
    if not isinstance(receipt, dict):
        result["reason"] = "receipt is not a JSON object"
        return result

    stored_id = receipt.get("receipt_id")
    stored_sig = receipt.get("signature")
    if not stored_id or not isinstance(stored_id, str):
        result["reason"] = "missing receipt_id"
        return result

    if set_commitment is not None:
        if pin_reference is None:
            result["reason"] = "pin-reference required with set-commitment"
            return result
        commitment = json.loads(Path(set_commitment).read_text(encoding="utf-8"))
        ckey = commitment_public_key if commitment_public_key is not None else public_key_record
        cpub = None
        if ckey is not None:
            cpub, _crec = load_public_key(Path(ckey))
        mem = membership_check(receipt, commitment, pin_reference, pub=cpub)
        result["membership_ok"] = mem["ok"]
        result["membership_reason"] = mem["reason"]
        if not mem["ok"]:
            result["ok"] = False
            result["reason"] = mem["reason"]
            return result
    if not stored_sig or not isinstance(stored_sig, str):
        result["reason"] = "missing signature"
        return result

    if receipt.get("certification_artifact_anchor_reference") == "not-anchored" and pin_file is None:
        result["reason"] = "pin-file required"
        return result

    if pin_file is not None:
        pin_res = pin_line_check(receipt, Path(pin_file))
        result["pin_line_ok"] = pin_res["ok"]
        result["pin_line_reason"] = pin_res["reason"]
        if not pin_res["ok"]:
            result["ok"] = False
            result["reason"] = pin_res["reason"]
            return result

    unsigned = stored_sig == "unsigned"

    try:
        signing_bytes = canonicalize(payload_for_signing(receipt))
        id_bytes = canonicalize(payload_for_receipt_id(receipt))
    except CanonError as e:
        result["reason"] = f"canonicalize refused: {e}"
        return result

    signing_sha = hashlib.sha256(signing_bytes).hexdigest()
    recomputed_id = "receipt-" + hashlib.sha256(id_bytes).hexdigest()[:16]
    result["signing_canonical_sha256"] = signing_sha
    result["signing_canonical_len"] = len(signing_bytes)
    result["recomputed_receipt_id"] = recomputed_id
    result["stored_receipt_id"] = stored_id

    if expect_canonical_sha256 is not None:
        result["expect_canonical_sha256"] = expect_canonical_sha256
        if signing_sha != expect_canonical_sha256.lower():
            result["reason"] = (
                f"canonical sha256 mismatch: computed={signing_sha} "
                f"expected={expect_canonical_sha256.lower()}"
            )
            return result

    if recomputed_id != stored_id:
        result["reason"] = (
            f"receipt_id mismatch: recomputed={recomputed_id} stored={stored_id}"
        )
        return result

    if unsigned:
        result["ok"] = False
        result["reason"] = "unsigned"
        return result

    pub, pub_rec, resolve_err = resolve_public_key(receipt, public_key_record)
    if resolve_err is not None:
        result["reason"] = resolve_err
        return result
    result["signing_key_id_announced"] = pub_rec.get("key_id")
    result["signing_key_id_receipt"] = receipt.get("signing_key_id")

    rec_key_id = pub_rec.get("key_id")
    if not rec_key_id or not isinstance(rec_key_id, str):
        result["reason"] = (
            "public key record does not name its key: key_id field is absent or empty"
        )
        return result

    rec_hex = pub_rec.get("public_key_hex", "")
    if rec_hex not in PINNED_KEYS.values():
        result["reason"] = (
            "record key material is not an announced key: public_key_hex is not pinned"
        )
        return result

    if PINNED_KEYS.get(rec_key_id) != rec_hex:
        result["reason"] = (
            f"record pairs key_id {rec_key_id!r} with hex belonging to a different announced key"
        )
        return result

    signing_key_id = receipt.get("signing_key_id")
    if not signing_key_id or not isinstance(signing_key_id, str):
        result["reason"] = (
            "receipt does not pin its signing key: signing_key_id field is absent or empty"
        )
        return result

    if signing_key_id != rec_key_id:
        result["reason"] = (
            f"signing_key_id mismatch: receipt={signing_key_id!r} "
            f"announced={rec_key_id!r}"
        )
        return result

    try:
        sig = bytes.fromhex(stored_sig)
    except ValueError:
        result["reason"] = "signature is not valid lowercase hex"
        return result

    try:
        pub.verify(sig, signing_bytes)
    except InvalidSignature:
        result["reason"] = "Ed25519 signature invalid under announced public key"
        return result

    result["ok"] = True
    result["reason"] = "PASS: receipt_id match and Ed25519 signature valid"
    return result


def cmd_verify(args: argparse.Namespace) -> int:
    path = Path(args.receipt)
    receipt = json.loads(path.read_text(encoding="utf-8"))
    res = verify_receipt(
        receipt,
        public_key_record=Path(args.public_key) if args.public_key else None,
        expect_canonical_sha256=args.expect_canonical_sha256,
        pin_file=Path(args.pin_file) if getattr(args, "pin_file", None) else None,
        set_commitment=Path(args.set_commitment) if getattr(args, "set_commitment", None) else None,
        pin_reference=args.pin_reference if getattr(args, "pin_reference", None) else None,
        commitment_public_key=(
            Path(args.commitment_public_key)
            if getattr(args, "commitment_public_key", None)
            else None
        ),
    )
    print(json.dumps(res, indent=2, sort_keys=True))
    return 0 if res["ok"] else 1


def cmd_dump_canonical(args: argparse.Namespace) -> int:
    path = Path(args.receipt)
    receipt = json.loads(path.read_text(encoding="utf-8"))
    mode = args.mode
    if mode == "signing":
        obj = payload_for_signing(receipt)
    elif mode == "receipt_id":
        obj = payload_for_receipt_id(receipt)
    else:
        print(f"unknown mode {mode}", file=sys.stderr)
        return 2
    b = canonicalize(obj)
    if args.format == "hex":
        sys.stdout.write(b.hex())
    elif args.format == "sha256":
        sys.stdout.write(hashlib.sha256(b).hexdigest())
    else:
        sys.stdout.buffer.write(b)
    if args.format != "raw":
        sys.stdout.write("\n")
    return 0


def cmd_vector(args: argparse.Namespace) -> int:
    """Verify an extended or exerciser-shaped test vector file."""
    vec = json.loads(Path(args.vector).read_text(encoding="utf-8"))
    failures: list[str] = []

    # Extended vector: cases[] with expected_sha256 / expect_refuse
    if "cases" in vec:
        for case in vec["cases"]:
            cid = case.get("id", "?")
            if case.get("expect_refuse"):
                try:
                    canonicalize(case["object"])
                    failures.append(f"{cid}: expected refuse, canonicalize accepted")
                except CanonError:
                    print(f"OK {cid}: refused as expected")
                continue
            try:
                b = canonicalize(case["object"])
            except CanonError as e:
                failures.append(f"{cid}: unexpected refuse: {e}")
                continue
            sha = hashlib.sha256(b).hexdigest()
            exp = case.get("expected_sha256")
            if exp and sha != exp:
                failures.append(f"{cid}: sha {sha} != {exp}")
            else:
                print(f"OK {cid}: sha256={sha}")
        if failures:
            for f in failures:
                print(f"FAIL {f}", file=sys.stderr)
            return 1
        print("VECTOR PASS")
        return 0

    # Exerciser shape: test_object + expected hashes
    obj = vec["test_object"]
    obj_for_id = {k: v for k, v in obj.items() if k not in ("receipt_id", "signature")}
    id_sha = hashlib.sha256(canonicalize(obj_for_id)).hexdigest()
    if id_sha != vec["expected"]["receipt_id_derivation_sha256"]:
        print(f"FAIL receipt_id sha {id_sha}", file=sys.stderr)
        return 1
    obj_for_signing = {k: v for k, v in obj.items() if k != "signature"}
    signing_sha = hashlib.sha256(canonicalize(obj_for_signing)).hexdigest()
    if signing_sha != vec["expected"]["canonical_bytes_for_signing_hex_sha256"]:
        print(f"FAIL signing sha {signing_sha}", file=sys.stderr)
        return 1

    test_key = vec["test_key"]
    # D-2026-08-22-CC-VERIFIER-PIN-API-KEY: additive, opt-in pinning check.
    # Every vector banked before this dispatch has no "pinned" field, takes
    # the branch below unchanged, and verifies its embedded test_key exactly
    # as before -- this block does not run for them.
    #
    # A vector with "pinned": true is asserting its key_id is a REAL
    # announced key, not a throwaway, and its verification must prove that
    # by using ONLY PINNED_KEYS to resolve the verifying key -- the vector's
    # own embedded public_key_hex is deliberately NOT trusted for this
    # purpose (a vector file that could supply its own trusted hex could
    # forge a "pinned" pass for an unpinned key, which would defeat the
    # point). If key_id is not in PINNED_KEYS, the vector fails here. This
    # is the only way `vector` can prove a claim about pinning rather than
    # trusting whatever hex the vector file happens to carry; unmodified
    # code with no "pinned" branch instead trusts test_key.public_key_hex
    # unconditionally, which is why the same vector, given a public_key_hex
    # that is NOT the real key (see the pinned vector's own comment),
    # verifies here and fails signature verification there.
    if test_key.get("pinned"):
        key_id = test_key.get("key_id")
        pinned_hex = PINNED_KEYS.get(key_id)
        if pinned_hex is None:
            print(
                f"FAIL not pinned: key_id={key_id!r} is not in PINNED_KEYS",
                file=sys.stderr,
            )
            return 1
        pub = Ed25519PublicKey.from_public_bytes(bytes.fromhex(pinned_hex))
    else:
        pub = Ed25519PublicKey.from_public_bytes(
            bytes.fromhex(test_key["public_key_hex"])
        )
    try:
        pub.verify(bytes.fromhex(obj["signature"]), canonicalize(obj_for_signing))
    except InvalidSignature:
        print("FAIL signature", file=sys.stderr)
        return 1
    print("VECTOR PASS (exerciser shape)")
    return 0


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="sentinel-canon-v1 reference verifier")
    p.add_argument(
        "--version",
        action="store_true",
        help="print tool and cryptography versions",
    )
    sub = p.add_subparsers(dest="cmd")

    v = sub.add_parser("verify", help="verify a receipt file")
    v.add_argument("receipt")
    v.add_argument(
        "--public-key",
        default=None,
        help=(
            "announced public key JSON record. Optional: no path relative "
            "to the repository is used as a default. When omitted, the "
            "key is resolved directly from PINNED_KEYS by the receipt's "
            "own signing_key_id."
        ),
    )
    v.add_argument(
        "--expect-canonical-sha256",
        default=None,
        help="optional banked signing-canonical sha256 to cross-check",
    )
    v.add_argument(
        "--set-commitment",
        default=None,
        help="set commitment JSON. Membership check is distinct from per-receipt verify.",
    )
    v.add_argument(
        "--pin-reference",
        default=None,
        help="pin reference the reader holds, matched against the commitment pin_reference",
    )
    v.add_argument(
        "--pin-file",
        default=None,
        help=(
            "explicit pin-of-record compose.ndjson path. Required for "
            "not-anchored pin receipts. Omitting it refuses. Shown receipts "
            "do not require the named pin fields."
        ),
    )
    v.add_argument(
        "--commitment-public-key",
        default=None,
        help=(
            "announced public key JSON for set-commitment Ed25519. "
            "When omitted, --public-key is used for the commitment signature."
        ),
    )

    d = sub.add_parser("dump-canonical", help="dump canonical bytes or hash")
    d.add_argument("receipt")
    d.add_argument(
        "--mode",
        choices=("signing", "receipt_id"),
        default="signing",
    )
    d.add_argument(
        "--format",
        choices=("hex", "sha256", "raw"),
        default="sha256",
    )

    t = sub.add_parser("vector", help="run a banked test vector file")
    t.add_argument("vector")

    args = p.parse_args(argv)
    if args.version:
        print(f"sentinel_canon_v1_verify CANON={CANON_VERSION} cryptography={CRYPTO_VERSION}")
        return 0
    if args.cmd == "verify":
        return cmd_verify(args)
    if args.cmd == "dump-canonical":
        return cmd_dump_canonical(args)
    if args.cmd == "vector":
        return cmd_vector(args)
    p.print_help()
    return 2


if __name__ == "__main__":
    sys.exit(main())
