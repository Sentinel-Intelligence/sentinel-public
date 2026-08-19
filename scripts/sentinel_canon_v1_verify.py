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

Signature: Ed25519 over signing bytes. Key pinning is mandatory: the receipt
must declare signing_key_id (a non-empty string) and the public key record
must carry a key_id (a non-empty string); verification refuses if either is
absent. When both are present they must match; a mismatch is refused before
the signature is checked. Default public key record:
docs/evidence/anchor_resume_2026-08-13/receipt_key_public_v1_0_1.json

Dependency: Python 3 stdlib + cryptography (Ed25519). Proven with cryptography
version printed on --version / verify output.

Usage:
  python3 scripts/sentinel_canon_v1_verify.py verify RECEIPT.json \\
      [--public-key PATH] [--expect-canonical-sha256 HEX]
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
DEFAULT_PUBKEY_RECORD = (
    Path(__file__).resolve().parents[1]
    / "docs/evidence/anchor_resume_2026-08-13/receipt_key_public_v1_0_1.json"
)


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


def load_public_key(record_path: Path) -> tuple[Ed25519PublicKey, dict]:
    rec = json.loads(record_path.read_text(encoding="utf-8"))
    hex_key = rec.get("public_key_hex")
    if not hex_key or not isinstance(hex_key, str):
        raise CanonError(f"public key record missing public_key_hex: {record_path}")
    pub = Ed25519PublicKey.from_public_bytes(bytes.fromhex(hex_key))
    return pub, rec


def verify_receipt(
    receipt: dict,
    *,
    public_key_record: Path,
    expect_canonical_sha256: str | None = None,
) -> dict[str, Any]:
    """Verify receipt_id and Ed25519 signature with mandatory key pinning.

    The receipt must declare signing_key_id as a non-empty string. The public
    key record must carry key_id as a non-empty string. Both must match. Any
    absence or mismatch is refused before signature verification runs.

    On failure sets ok=False and reason; never raises for crypto mismatch
    (raises only on structural/IO errors that prevent running the check).
    """
    result: dict[str, Any] = {
        "ok": False,
        "canonicalization_version": CANON_VERSION,
        "cryptography_version": CRYPTO_VERSION,
        "public_key_record": str(public_key_record),
    }
    if not isinstance(receipt, dict):
        result["reason"] = "receipt is not a JSON object"
        return result

    stored_id = receipt.get("receipt_id")
    stored_sig = receipt.get("signature")
    if not stored_id or not isinstance(stored_id, str):
        result["reason"] = "missing receipt_id"
        return result
    if not stored_sig or not isinstance(stored_sig, str):
        result["reason"] = "missing signature"
        return result

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

    pub, pub_rec = load_public_key(public_key_record)
    result["signing_key_id_announced"] = pub_rec.get("key_id")
    result["signing_key_id_receipt"] = receipt.get("signing_key_id")

    rec_key_id = pub_rec.get("key_id")
    if not rec_key_id or not isinstance(rec_key_id, str):
        result["reason"] = (
            "public key record does not name its key: key_id field is absent or empty"
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
        public_key_record=Path(args.public_key),
        expect_canonical_sha256=args.expect_canonical_sha256,
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
    pub = Ed25519PublicKey.from_public_bytes(
        bytes.fromhex(vec["test_key"]["public_key_hex"])
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
        default=str(DEFAULT_PUBKEY_RECORD),
        help="announced public key JSON record",
    )
    v.add_argument(
        "--expect-canonical-sha256",
        default=None,
        help="optional banked signing-canonical sha256 to cross-check",
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
