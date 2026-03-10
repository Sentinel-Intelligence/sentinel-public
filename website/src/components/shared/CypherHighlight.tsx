interface CypherHighlightProps {
  code: string
}

const KEYWORDS = /\b(MATCH|WHERE|RETURN|WITH|ORDER BY|LIMIT|OPTIONAL MATCH|CREATE|MERGE|DELETE|SET|DETACH|UNWIND|CALL|YIELD|AS|AND|OR|NOT|IN|IS|NULL|DISTINCT|SKIP|ASC|DESC|COUNT|COLLECT|SUM|AVG|MIN|MAX|EXISTS|CASE|WHEN|THEN|ELSE|END)\b/g
const STRINGS = /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g
const NUMBERS = /\b(\d+(?:\.\d+)?)\b/g
const NODE_LABELS = /(:\w+)(?=\s*[\)\]{}|,]|$)/g
const REL_TYPES = /\[(?::[\w|]+)]/g
const PROPERTIES = /\.(\w+)/g
const COMMENTS = /(\/\/[^\n]*)/g

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function highlight(code: string): string {
  // Escape HTML first
  let out = escapeHtml(code)

  // Order matters — apply from most specific to least
  out = out.replace(COMMENTS,    '<span style="color:#6b7280">$1</span>')
  out = out.replace(STRINGS,     '<span style="color:#4ade80">$1</span>')
  out = out.replace(REL_TYPES,   m => `<span style="color:#c084fc">${m}</span>`)
  out = out.replace(NODE_LABELS, '<span style="color:#fb923c">$1</span>')
  out = out.replace(KEYWORDS,    '<span style="color:#fbbf24;font-weight:700">$1</span>')
  out = out.replace(NUMBERS,     '<span style="color:#60a5fa">$1</span>')
  out = out.replace(PROPERTIES,  '.<span style="color:#e2e8f0">$1</span>')

  return out
}

export default function CypherHighlight({ code }: CypherHighlightProps) {
  return (
    <pre
      className="text-xs font-mono overflow-x-auto rounded bg-gray-950 border border-gray-800 p-3 leading-relaxed whitespace-pre-wrap break-all"
      dangerouslySetInnerHTML={{ __html: highlight(code) }}
    />
  )
}
