import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify a Sentinel receipt | Sentinel Intelligence',
  description:
    'How to check that a Sentinel receipt is authentic using public tools and the public XRP Ledger. No account, key, or permission required.',
  alternates: {
    canonical: 'https://sentinelintel.org/verify',
  },
}

export default function VerifyPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-cyan-500 text-xs tracking-widest uppercase mb-4">Verify</div>
      <h1 className="text-3xl font-bold mb-8">Verify a Sentinel receipt</h1>

      {/* 1.1 Opening */}
      <div className="space-y-4 mb-12">
        <p className="text-gray-300 text-sm leading-relaxed">
          Every answer this system gives comes with a signed receipt, and so does every
          refusal. This page shows you how to check that a receipt is authentic, using
          public tools and the public XRP Ledger. You do not need an account, a key, or
          our permission.
        </p>
        <p className="text-gray-300 text-sm leading-relaxed">
          <strong className="text-gray-100">You do not need to trust us for the checks on this page.</strong>{' '}
          You do need the three constants in section 1.2 to be the real ones. Every check
          here compares a receipt against those three values, so a reader who got them from
          a page we control has checked us against ourselves.{' '}
          <strong className="text-gray-100">
            That is why the key identifier is published here as well as announced on the
            ledger: two places to compare, not one.
          </strong>{' '}
          If the two ever disagree, that disagreement is the finding.
        </p>
        <p className="text-gray-400 text-sm leading-relaxed">
          Checking a receipt tells you the record is genuine and unaltered. It does not
          tell you the answer is right. Those are different questions and this page is only
          about the first one. What a receipt does and does not establish is set out at the
          bottom of this page.
        </p>
      </div>

      {/* 1.2 The three constants */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-cyan-300 mb-4">The three constants</h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-5">
          Three values identify us. Compare them exactly, character for character. A value
          that is close is not a match.
        </p>
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-5 mb-5">
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">
              Our ledger wallet
            </div>
            <code className="text-cyan-300 font-mono text-sm break-all">
              rLFteU7TV2dP2UNteJPFJE8h8sJjPjqkLV
            </code>
          </div>
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">
              The memo type that announces a signing key
            </div>
            <code className="text-cyan-300 font-mono text-sm">sentinel/receipt-key/v1</code>
          </div>
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">
              The signing key currently in use
            </div>
            <code className="text-cyan-300 font-mono text-sm">receipt-ed25519-3a89049da148a9d4</code>
          </div>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">
          Anything announced under a different memo type is not ours, even if the string is
          nearly identical. Anything on a different wallet is not ours, even if the address
          begins the same way. We publish the wallet here so you never have to take a
          receipt&apos;s word for which wallet to look at.
        </p>
      </div>

      {/* 1.3 Check that the key identifier belongs to the key */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-cyan-300 mb-4">
          Check that the key identifier belongs to the key
        </h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          Our key identifier is not a label we chose. It is computed from the key itself,
          so you can check that they belong together.
        </p>
        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          The identifier&apos;s hex portion is the first eight bytes of the SHA-256 digest
          of the raw 32-byte public key, written in lowercase hex.
        </p>
        <div className="mb-4">
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">
            The announced public key:
          </div>
          <code className="text-cyan-300 font-mono text-sm break-all">
            944a0bff9fa8cd3f6acd2d657a3f3adb1456d79b03f000405e0d4340d9afbe29
          </code>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed mb-2">
          Run this and compare the output to the identifier above:
        </p>
        <pre className="bg-gray-900 border border-gray-700 rounded p-4 text-xs text-cyan-200 font-mono overflow-x-auto mb-4 whitespace-pre-wrap break-all">
          {`python3 -c "import hashlib; print(hashlib.sha256(bytes.fromhex('944a0bff9fa8cd3f6acd2d657a3f3adb1456d79b03f000405e0d4340d9afbe29')).hexdigest()[:16])"`}
        </pre>
        <p className="text-gray-300 text-sm leading-relaxed mb-2">Expected output:</p>
        <pre className="bg-gray-900 border border-gray-700 rounded p-4 text-xs text-cyan-200 font-mono overflow-x-auto mb-4">
          3a89049da148a9d4
        </pre>
        <p className="text-gray-400 text-sm leading-relaxed">
          If a memo ever announces this same identifier with a different public key, this
          check fails and the announcement is not ours.
        </p>
      </div>

      {/* 1.4 Find the announcement on the ledger */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-cyan-300 mb-4">
          Find the announcement on the ledger
        </h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-6">
          There are two ways to look. The first is one lookup and takes a few seconds. The
          second is slower and is the complete check.{' '}
          <strong className="text-gray-100">
            Both are described because the fast one does not prove everything.
          </strong>
        </p>

        <h3 className="text-cyan-400 font-semibold mb-3">The fast path, one lookup</h3>
        <p className="text-gray-300 text-sm leading-relaxed mb-3">
          Our key announcement is a single ledger transaction:
        </p>
        <div className="bg-gray-900 border border-gray-700 rounded p-4 mb-4">
          <code className="text-cyan-300 font-mono text-xs break-all">
            C1E819016EEFF86C723BFF0E5FD0F05A2204EAC1A120EE2715E40DE667A3072B
          </code>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed mb-3">
          <strong className="text-gray-100">In a ledger explorer:</strong> open that
          transaction at{' '}
          <code className="text-cyan-400 text-xs break-all">
            https://livenet.xrpl.org/transactions/C1E819016EEFF86C723BFF0E5FD0F05A2204EAC1A120EE2715E40DE667A3072B
          </code>{' '}
          and switch to the <strong className="text-gray-100">Detailed</strong> view.{' '}
          <strong className="text-gray-100">
            The Simple view does not display memos at all
          </strong>
          , so a reader who stays on it will conclude there is nothing there. The Detailed
          view decodes the memo and shows the announced key.
        </p>
        <p className="text-gray-300 text-sm leading-relaxed mb-3">
          <strong className="text-gray-100">The transaction URL form is</strong>{' '}
          <code className="text-cyan-400 text-xs">
            https://livenet.xrpl.org/transactions/&lt;TRANSACTION_HASH&gt;
          </code>
          .{' '}
          <strong className="text-gray-100">Any explorer will do.</strong> We name one so
          the instruction above is executable without a search, not because this one is
          authoritative.{' '}
          <strong className="text-gray-100">
            No explorer is authoritative: the ledger is, and an explorer is a reader for
            it.
          </strong>{' '}
          If an explorer shows you something different from the direct query below, believe
          the query.
        </p>
        <p className="text-gray-300 text-sm leading-relaxed mb-2">
          <strong className="text-gray-100">
            By direct query, no account or key required:
          </strong>
        </p>
        <pre className="bg-gray-900 border border-gray-700 rounded p-4 text-xs text-cyan-200 font-mono overflow-x-auto mb-4 whitespace-pre-wrap break-all">
          {`curl -s -X POST https://xrplcluster.com -H 'Content-Type: application/json' -d '{"method":"tx","params":[{"transaction":"C1E819016EEFF86C723BFF0E5FD0F05A2204EAC1A120EE2715E40DE667A3072B"}]}'`}
        </pre>
        <p className="text-gray-300 text-sm leading-relaxed mb-3">
          The memo type and the announced public key are in the response. The memo type must
          equal <code className="text-cyan-400 text-xs">sentinel/receipt-key/v1</code>{' '}
          exactly and the key must equal the value in section 1.3.
        </p>
        <p className="text-gray-300 text-sm leading-relaxed mb-3">
          <strong className="text-gray-100">About that endpoint.</strong>{' '}
          <code className="text-cyan-400 text-xs">xrplcluster.com</code> is a public XRP
          Ledger JSON-RPC endpoint and it is the one our own measurement tooling queries.{' '}
          <strong className="text-gray-100">
            It is not ours and we do not control it.
          </strong>{' '}
          Any public XRPL JSON-RPC endpoint answers these two commands, and substituting
          one you trust is expected rather than discouraged.{' '}
          <strong className="text-gray-100">
            If a lookup fails, that may be the endpoint rather than us
          </strong>
          , and trying a second one is the first thing to do.
        </p>
        <p className="text-gray-300 text-sm leading-relaxed mb-1">
          <strong className="text-gray-100">What the fast path proves:</strong> that this
          announcement exists on our wallet, at a recorded time, and says what we say it
          says.
        </p>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          <strong className="text-gray-100">What it does not prove:</strong> that it is the
          only announcement for this key identifier. For that, use the complete path.
        </p>

        <h3 className="text-cyan-400 font-semibold mb-3">The complete path, uniqueness</h3>
        <p className="text-gray-300 text-sm leading-relaxed mb-3">
          Scan the wallet&apos;s transaction history for every memo of type{' '}
          <code className="text-cyan-400 text-xs">sentinel/receipt-key/v1</code> and confirm
          that exactly one announces{' '}
          <code className="text-cyan-400 text-xs">receipt-ed25519-3a89049da148a9d4</code>,
          and that no later memo retires it.
        </p>
        <pre className="bg-gray-900 border border-gray-700 rounded p-4 text-xs text-cyan-200 font-mono overflow-x-auto mb-4 whitespace-pre-wrap break-all">
          {`curl -s -X POST https://xrplcluster.com -H 'Content-Type: application/json' -d '{"method":"account_tx","params":[{"account":"rLFteU7TV2dP2UNteJPFJE8h8sJjPjqkLV","limit":400}]}'`}
        </pre>
        <p className="text-gray-300 text-sm leading-relaxed">
          The history is paginated. Follow the{' '}
          <code className="text-cyan-400 text-xs">marker</code> field until it stops being
          returned.{' '}
          <strong className="text-gray-100">
            If you would rather not page it by hand, our verification script does this loop
            for you and is published at
          </strong>{' '}
          <code className="text-cyan-400 text-xs">
            docs/evidence/xrpl_anchor_state_2026-08-13/xrpl_anchor_state_measure.py
          </code>{' '}
          <strong className="text-gray-100">
            in the public repository. The script is a convenience and not the authority:
            the two commands above are the whole check, and a reader who runs them has done
            the same work.
          </strong>
        </p>
      </div>

      {/* 1.5 The rule for accepting a key */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-cyan-300 mb-4">
          The rule for accepting a key
        </h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-5">
          Accept a signing key only if all four of these hold.{' '}
          <strong className="text-gray-100">
            If you can only do one check, do the fourth, because it needs no lookup at all.
          </strong>
        </p>
        <div className="space-y-3 mb-5">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-cyan-400 font-semibold text-sm mb-1">One. Uniqueness.</div>
            <p className="text-gray-300 text-sm leading-relaxed">
              The wallet{' '}
              <code className="text-cyan-400 text-xs">rLFteU7TV2dP2UNteJPFJE8h8sJjPjqkLV</code>{' '}
              carries exactly one memo of type{' '}
              <code className="text-cyan-400 text-xs">sentinel/receipt-key/v1</code> announcing
              the receipt&apos;s key identifier.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-cyan-400 font-semibold text-sm mb-1">Two. No retirement.</div>
            <p className="text-gray-300 text-sm leading-relaxed">
              No later memo retires that identifier.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-cyan-400 font-semibold text-sm mb-1">Three. Timing.</div>
            <p className="text-gray-300 text-sm leading-relaxed">
              The receipt&apos;s execution timestamp falls inside the announcement&apos;s
              validity window.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="text-cyan-400 font-semibold text-sm mb-1">Four. Derivation.</div>
            <p className="text-gray-300 text-sm leading-relaxed">
              The key identifier equals the first eight bytes of the SHA-256 digest of the
              announced 32-byte public key, in lowercase hex. Section 1.3.
            </p>
          </div>
        </div>
        <div className="border-l-2 border-cyan-700 pl-5 mb-4">
          <p className="text-gray-200 text-sm leading-relaxed font-medium">
            If two or more live announcements share one key identifier, do not choose between
            them. Reject the receipt and tell us.
          </p>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">
          That last instruction matters more than it looks. Choosing the newest, or the
          oldest, or the one with the earliest start date is exactly what an attacker who
          managed to post a second announcement would be counting on.{' '}
          <strong className="text-gray-100">
            The safe response to an ambiguity is to stop, not to pick.
          </strong>
        </p>
      </div>

      {/* 1.6 Check a receipt's contents */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-cyan-300 mb-4">
          Check a receipt&apos;s contents
        </h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-5">
          A receipt carries a hash of the result rows it came with. If you were given the
          rows, you can confirm they are the rows the receipt describes.
        </p>
        <div className="space-y-4 mb-5">
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">On Linux:</div>
            <pre className="bg-gray-900 border border-gray-700 rounded p-4 text-xs text-cyan-200 font-mono overflow-x-auto">
              sha256sum results.json
            </pre>
          </div>
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">On macOS:</div>
            <pre className="bg-gray-900 border border-gray-700 rounded p-4 text-xs text-cyan-200 font-mono overflow-x-auto">
              shasum -a 256 results.json
            </pre>
          </div>
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">
              On Windows, in PowerShell:
            </div>
            <pre className="bg-gray-900 border border-gray-700 rounded p-4 text-xs text-cyan-200 font-mono overflow-x-auto">
              Get-FileHash results.json -Algorithm SHA256
            </pre>
          </div>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed mb-3">
          Compare the output to the receipt&apos;s{' '}
          <code className="text-cyan-400 text-xs">result_hash</code>. They must match
          exactly.
        </p>
        <p className="text-gray-300 text-sm leading-relaxed">
          <strong className="text-gray-100">
            Also compare the number of rows you were shown against the receipt&apos;s{' '}
            <code className="text-cyan-400 text-xs">result_row_count</code>.
          </strong>{' '}
          If you were shown fewer rows than that number, you are looking at a selection and
          not at the full result. The receipt is still genuine; the presentation is partial.
        </p>
      </div>

      {/* 1.7 The authenticity notice */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-cyan-300 mb-4">The authenticity notice</h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          This sentence is inside every receipt we issue, where it cannot be removed without
          breaking the signature:
        </p>
        <blockquote className="border-l-2 border-cyan-700 pl-5 text-gray-300 text-sm leading-relaxed italic">
          A valid signature establishes that this record is authentic and has not been
          altered. It does not establish that the executed query answers the question as it
          was asked. No accuracy claim is made about this answer, and absolute accuracy
          claims for this system remain gated pending completion of the reference repair.
        </blockquote>
      </div>

      {/* 1.8 What this proves and what it does not */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-cyan-300 mb-4">
          What this proves and what it does not
        </h2>
        <div className="space-y-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            <strong className="text-gray-100">
              A receipt that passes every check above establishes four things.
            </strong>{' '}
            That a specific query, from a library of queries a person reviewed and certified
            beforehand, was run at a recorded time. That it ran against a recorded snapshot
            of the data structure. That the rows you hold are the rows it returned. And that
            we signed the record with a key we announced publicly, on a ledger, before you
            asked.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            <strong className="text-gray-100">
              It does not establish that the query answers your question.
            </strong>{' '}
            The query was selected by matching your question against a fixed set. Selection
            can be wrong, and when it is wrong the result is a real answer to a different
            question.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            <strong className="text-gray-100">
              It does not establish that the underlying data is correct or current.
            </strong>{' '}
            The data comes from public federal filings. We record what the filings say and
            when we ingested them. We do not audit the filers.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            <strong className="text-gray-100">
              It does not establish that a record is a finding.
            </strong>{' '}
            A relationship in this data records that a filing exists. It is not a finding of
            wrongdoing or intent, and it should not be reported as one.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            <strong className="text-gray-100">
              And it does not establish that the answer is complete.
            </strong>{' '}
            Every receipt carries a coverage figure. Read it.
          </p>
        </div>
      </div>

      {/* 1.9 If a check fails */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-cyan-300 mb-4">If a check fails</h2>
        <div className="space-y-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            If any check on this page fails, the receipt should not be treated as ours. Tell
            us, and tell whoever gave it to you.
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">
            <strong className="text-gray-100">
              A failed check is not a normal outcome and should not be treated as one.
            </strong>{' '}
            If you find yourself seeing failures routinely, something is wrong on our side
            and we want to know.
          </p>
        </div>
      </div>
    </section>
  )
}
