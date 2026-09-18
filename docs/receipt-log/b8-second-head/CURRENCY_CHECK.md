# Offline currency-check path (design revision 8)

This is the documented offline currency-check path for a receipt R under the published second B-8 head H.

Surfaces (files in this directory, invoked via `receipt_log.py`):

- get-STH: `receipt_log.py sth` reads `sth.json` (signed H with supersession commitment, published map, reissue census, prior-id list).
- get-inclusion-proof: `receipt_log.py inclusion-proof INDEX`
- get-currency-proof: `receipt_log.py currency-proof RECEIPT_ID`
- get-consistency-proof: `receipt_log.py consistency-proof OLD_SIZE NEW_SIZE`
- get-entries: `receipt_log.py entries START COUNT`

Map-digest recompute is necessary and insufficient under a sole signer.

Ordered reader steps (design revision 8 currency artifact):

1. Verify the signature on H with the announced log key. If a last accepted head is stored, verify RFC 9162 consistency from that head to H. If no numeric maximum head age is configured, stop with FAILURE: head-age-unconfigured.
2. Recompute every head field the signature covers. Recompute supersession_counts_sha256 from the published map and require equality. On mismatch: FAILURE: head-map-digest.
3. Run the reissue census reader check (banked sidecar pin first).
4. From the leaf, check receipt_id equals receipt- plus the first sixteen hex of id_derivation_sha256, signature_present is signature-present, signing_key_id nonempty.
5. Recompute the receipt-v1 leaf hash and verify inclusion against H.
6. Let c = supersession_counts[R] else 0. If package length is not c: FAILURE: supersession-package-incomplete.
7. For each package entry, recompute the supersede leaf hash and verify inclusion.
8. If package length is at least 1, stop with FAILURE: superseded.
9. Duplicate same successor: FAILURE: duplicate-supersession-same-successor.
10. Differing successors: FAILURE: ambiguous-supersession.
11. If c is 0 and package empty and steps 1 to 7 succeeded, accept R as current under H only subject to LIMITS.

Independent witness cosignatures are not this publish.
