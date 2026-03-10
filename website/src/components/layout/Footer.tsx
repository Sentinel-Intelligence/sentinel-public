export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-24 px-6 py-10 text-center text-gray-500 text-sm">
      <p className="mb-2">© 2026 Sentinel Intelligence LLC · MIT License · Built with public federal data</p>
      <p className="mb-4">Built with Neo4j · Python · Qwen2.5 · XRPL</p>
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600">
        <span className="border border-gray-800 px-3 py-1 rounded">
          IC2S2 2026 Submission — Under Review
        </span>
        <a
          href="https://github.com/Sentinel-Intelligence/sentinel-public"
          className="hover:text-gray-400 transition-colors border border-gray-800 px-3 py-1 rounded"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <a
          href="mailto:contact@sentinelintel.org"
          className="hover:text-gray-400 transition-colors border border-gray-800 px-3 py-1 rounded"
        >
          Contact
        </a>
      </div>
    </footer>
  )
}
