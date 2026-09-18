# Offline currency-check path (design revision 8)

This is the documented offline currency-check path for a receipt R under the published second B-8 head H.

Surfaces (files in this directory, invoked via `receipt_log.py`):

- get-STH: `receipt_log.py sth` reads `sth.json` (signed H with supersession commitment, published map, reissue census, prior-id list).
- get-inclusion-proof: `receipt_log.py inclusion-proof INDEX`
- get-currency-proof: `receipt_log.py currency-proof RECEIPT_ID`
- get-consistency-proof: `receipt_log.py consistency-proof OLD_SIZE NEW_SIZE`
- get-entries: `receipt_log.py entries START COUNT`

Map-digest recompute is necessary and insufficient under a sole signer.

Pinned expected head-age policy values (amendment v1.0.3 section 3.4). A stranger compares these to `head_age_policy.json` after bootstrap. If they differ: FAILURE: policy-pin-mismatch.

- maximum_head_age_hours: 24
- clock_skew_tolerance_seconds: 300
- published_time_field: timestamp

Ordered reader steps (design revision 8 currency artifact, with amendment v1.0.3 bootstrap and age rule):

0. Ordered bootstrap (amendment section 1.4). Fail closed on any of: FAILURE: companion-key-unreadable; FAILURE: companion-manifest-missing; FAILURE: companion-manifest-verify; FAILURE: companion-digest-mismatch; FAILURE: companion-manifest-head-mismatch; FAILURE: head-signature-verify; FAILURE: companion-key-drift; FAILURE: companion-unmanifested. Only after bootstrap success may the reader trust companion bytes listed in the verified manifest.
1. Load `head_age_policy.json` only if listed and digest-matched in that verified manifest. Apply section 3.4 pin checks (expected values above). If `maximum_head_age_hours` is not 24, or `clock_skew_tolerance_seconds` is not 300, or `published_time_field` is not timestamp: FAILURE: policy-pin-mismatch. Age the head from the signed field `timestamp` only (section 2). If `timestamp` is absent, empty, or not parseable: FAILURE: published-time-missing. If `timestamp` is strictly greater than reader now plus `clock_skew_tolerance_seconds` seconds: FAILURE: clock-skew. Compute age as reader now minus `timestamp`. If age is greater than `maximum_head_age_hours` converted to seconds: FAILURE: head-stale; refresh get-STH before any currency accept. Skew tolerance does not widen the maximum age. If the policy is missing, unreadable, or the field is not a positive integer: FAILURE: head-age-unconfigured.
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
