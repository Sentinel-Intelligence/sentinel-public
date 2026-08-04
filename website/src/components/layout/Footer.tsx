export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-24 px-6 py-10 text-center text-gray-500 text-sm">
      <p className="mb-2">
        © 2026 Sentinel Intelligence LLC · MIT License · Public federal data
      </p>
      <p className="mb-4 text-xs text-gray-600 max-w-lg mx-auto leading-relaxed">
        What we show is what we ingested. We can prove when, and that we have not
        altered it since. We cannot prove the filer told the truth.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600">
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
