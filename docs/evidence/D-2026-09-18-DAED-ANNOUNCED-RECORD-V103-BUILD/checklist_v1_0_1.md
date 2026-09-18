# D-2026-09-18-DAED-PACK-REPAIR-RESTAGE-AND-PUBLISH checklist v1.0.1

Seat: Swarm, board key `swarm`. Hub: Atlas. Document class: buyer-facing verify checklist (one page). Authoring only. Generic to every pack. Binds to design `docs/review/D-2026-09-06-SWARM-PITCH-DECK-REBUILD-DESIGN_design_v1_0_3.md` prerequisite two. Opens none. Resolves none. Do not self-close.

## HUB BLOCK

1. Get-verifier step names the raw script URL from the brief, states the HTML verify page is not the script, and tells the buyer to record the sha256 they observe and compare it to the pack cover (no digest value on this page).
2. Get-record step names the anchored-record URL from the brief and the same observe-and-compare rule against the pack cover.
3. Inputs list every verify flag the packed script parses, and for each states enclosed in the pack or fetched in steps 1 and 2; the commitment public key is enclosed, not fetched from the public tree.
4. Run step gives the command shape with flags in the packed script's order and pack file names only (no host paths from `docs/evidence/D-2026-09-08-DAED-V102-ANCHOR-AND-PUBLISH/reader_command.txt`).
5. Pass and refuse meanings cover missing pin file, unsigned or missing commitment signature, non-matching pin digest, and legacy signing-key mismatch, from the packed script and `docs/review/D-2026-09-06-DAED-PUBLIC-VERIFIER-HARDEN-PUBLISH_halt_report_v1_0_0.md` plant list; signature alone is not complete verify.
6. Per-pack values (script digest, record digest, receipt ids) are assigned to the pack cover; this page carries no digest value.
7. Buyer language throughout; the only seller-process terms are the script's own flag names.

STATUS: Draft checklist for enclosure in a pack. Not a send. Not an offer. Not an invoice.

# One-page verify checklist (buyer)

Use this page with the enclosed pack. Per-pack digests and receipt ids are printed on the pack cover, not here.

## 1. Get the verifier

1. Download the verifier script from:
   `https://raw.githubusercontent.com/Sentinel-Intelligence/sentinel-public/main/scripts/sentinel_canon_v1_verify.py`
2. The HTML page `https://sentinelintel.org/verify` is a verify page. It is not the verifier script. Use the raw script above (`docs/review/D-2026-09-06-DAED-PUBLIC-VERIFIER-HARDEN-PUBLISH_halt_report_v1_0_0.md`).
3. Compute the sha256 of the file you downloaded. Compare it to the script digest printed on the pack cover. If they differ, stop.

## 2. Get the anchored record

1. Download the published anchored record from:
   `https://raw.githubusercontent.com/Sentinel-Intelligence/sentinel-public/main/docs/evidence/D-2026-09-18-DAED-ANNOUNCED-RECORD-V103-BUILD/announced_record_public_v1_0_3.json`
2. Compute the sha256 of the file you downloaded. Compare it to the record digest printed on the pack cover. If they differ, stop.
3. Save that file next to your pack inputs. You will pass it as `--public-key` (that is the flag name the script uses for this record file).

## 3. Inputs the script needs

Take these from the enclosed pack unless marked fetched. Flag names are exactly as `docs/evidence/D-2026-09-17-SWARM-VERIFY-CHECKLIST-AUTHOR/sentinel_canon_v1_verify.py` parses them. Do not fetch the commitment public key from the public tree; the pack encloses it.

| Flag (script name) | What it is | Source |
| --- | --- | --- |
| `receipt` (positional) | One receipt JSON to verify | Enclosed in the pack |
| `--public-key` | Announced public-key / anchored-record JSON the script reads for verify | Fetched in step 2 (anchored record URL above) |
| `--expect-canonical-sha256` | Optional banked signing-canonical sha256 cross-check | Optional; only if the pack cover prints one for this receipt |
| `--set-commitment` | Set-commitment JSON (membership check) | Enclosed in the pack |
| `--pin-reference` | Pin reference string matched to the commitment's pin reference | Enclosed in the pack (value the pack cover or pin-reference file names) |
| `--pin-file` | Pin-of-record compose file (required for not-anchored pin receipts; omitting refuses) | Enclosed in the pack |
| `--commitment-public-key` | Public key JSON for set-commitment Ed25519 | Enclosed in the pack (not on the public tree) |

You also need the verifier script file from step 1.

## 3.5 Prerequisite: cryptography module

Stock Python does not ship the Ed25519 module this verifier imports. Before section 4, install a pinned release into the same Python that will run the script.

Third fetch (explicit): this install uses the Python Package Index (PyPI) at https://pypi.org in addition to the two checklist fetch URLs. Checklist LIMITS names PyPI as that third fetch.

MEASUREMENT on the land host: cryptography 46.0.7; wheel cryptography-46.0.7-cp311-abi3-manylinux_2_34_x86_64.whl; wheel sha256 42a1e5f98abb6391717978baf9f90dc28a743b7d9be7f0751a6f56a75d14065b.

Install form (version pin required). Stock pip on the land-host class does not accept `--hash` as a `pip install` option on a single specifier (hashes belong in a requirements file and then every dependency must also be hashed). This publish therefore carries the wheel digest as MEASUREMENT and installs with the version pin:

python3 -m pip install cryptography==46.0.7

Then confirm the import works:

python3 -c "import cryptography; print(cryptography.__version__)"

If that import fails, stop. Do not run section 4.

## 4. Run

From a working directory that holds the enclosed pack files and the two files you fetched, run (flags in the packed script's verify order; replace names only with the names your pack cover prints):

```
python3 sentinel_canon_v1_verify.py verify receipt.json \
  --public-key announced_record_public_v1_0_3.json \
  --set-commitment set_commitment.json \
  --pin-reference <pin-reference-value-from-pack> \
  --pin-file compose.ndjson \
  --commitment-public-key commitment_public_key.json
```

If the pack cover lists `--expect-canonical-sha256` for this receipt, add that flag with the cover value after `--public-key`. Do not invent a hex value on this page.

Repeat once per receipt id the pack cover lists. A signature check by itself is not a complete verify. When the pack shows membership, membership is checked against the anchored record from step 2 via `--set-commitment` and `--commitment-public-key`.

## 5. What pass looks like

- The command exits successfully for that receipt.
- Pin-line checks pass when the receipt requires the pin file.
- When membership is shown, membership against the anchored record passes (harden publish plant: clean run with pin file, pin-reference, signed commitment, and `--commitment-public-key`).
- Multi-key acceptance: pass when the receipt `signing_key_id` equals the anchored record top-level `key_id` or a pinned `receipt_signing_keys` item, and the signature verifies under the matched id's public hex (not under a different key's bytes).

## 6. What refuse means (stop and do not treat as verified)

| Refuse (as plants / script report) | Meaning |
| --- | --- |
| `pin-file required` / pin file missing | You omitted `--pin-file`, or the pin file is not present. Not-anchored pin receipts require the enclosed pin file (`docs/review/D-2026-09-06-DAED-PUBLIC-VERIFIER-HARDEN-PUBLISH_halt_report_v1_0_0.md` plant 1; packed script). |
| `unsigned` or `signature missing` | The set-commitment signature is absent or the commitment is unsigned. Use the enclosed commitment and enclosed `--commitment-public-key` (plant 2). |
| `pin file digest mismatch` | The pin file bytes do not match what the receipt expects. Use the enclosed pin file for this pack (plant 3). |
| `signing_key_id mismatch` | Legacy signing-key mismatch refuse (plant 5). Do not treat the receipt as verified under this checklist. |
| list entry not pinned | A `receipt_signing_keys` item is not a pinned announced key. Do not treat the receipt as verified. |
| signature under the wrong key | After a list match, signature bytes were checked under top-level hex that names the other key. Do not treat the receipt as verified. |
| Other script refuse lines (for example pin-reference mismatch, cited field mismatches inside the script) | Treat as failed verify. Seller-process field names stay inside the script output; you do not need them on a slide. |

## Flag table (source of record)

| Flag | Source in packed script | Enclosed or fetched |
| --- | --- | --- |
| `verify` (subcommand) | `docs/evidence/D-2026-09-17-SWARM-VERIFY-CHECKLIST-AUTHOR/sentinel_canon_v1_verify.py` verify subparser | n/a (invocation) |
| `receipt` | positional `v.add_argument("receipt")` | Enclosed |
| `--public-key` | verify `--public-key` | Fetched (step 2 anchored record) |
| `--expect-canonical-sha256` | verify `--expect-canonical-sha256` | Optional cover value only |
| `--set-commitment` | verify `--set-commitment` | Enclosed |
| `--pin-reference` | verify `--pin-reference` | Enclosed |
| `--pin-file` | verify `--pin-file` (required for not-anchored pin receipts; omit refuses) | Enclosed |
| `--commitment-public-key` | verify `--commitment-public-key` | Enclosed (not public tree) |

Command shape cross-check: `docs/evidence/D-2026-09-08-DAED-V102-ANCHOR-AND-PUBLISH/reader_command.txt` (seller host paths stripped; pack names only).

## LIMITS

- No digest value appears on this page; digests live on the pack cover.
- Fetch URLs: the two checklist fetch URLs (script and anchored record), plus the HTML verify page named only to say it is not the script, plus PyPI at https://pypi.org as the explicit third fetch for section 3.5.
- No repository, graph, board, host, or live fetch performed in this authoring.
- Does not send a deck or a pack. Does not offer or invoice.
- Commitment public key is pack-enclosed; this checklist does not send the buyer to the public tree for it.
- Buyer success is not proved here; a later clean-machine rehearsal with an enclosed pack is required.

## Plants

1. Known positive: PASS. This checklist requires `--pin-file` and treats omit as refuse, matching the packed script and harden publish plant 1.
2. Known negative: PASS. `--commitment-public-key` is enclosed in the pack; this checklist does not send the buyer to the public tree for it.
3. Clean control: PASS. No digest value on this page; only the brief's two fetch URLs (and the HTML page named as not the script); per-pack values assigned to the pack cover.

What the plants do not prove: they do not prove a buyer succeeds on a clean machine with a real enclosed pack.

## What could not be checked

- Live HTTP fetch of either URL in this seat (reach forbids; hub measurements in the brief are cited, not re-run).
- Contents of a specific seller pack cover (per-pack; not packed here).
- Repository, graph, board, and host state (forbidden).

Report to the hub. Do not self-close.
