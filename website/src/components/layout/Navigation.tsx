'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_ITEMS = [
  { label: 'Overview',       href: '/' },
  { label: 'Investigations', href: '/investigations' },
  { label: 'Graph',          href: '/graph' },
  { label: 'How It Works',   href: '/methodology' },
  { label: 'About',          href: '/about' },
  { label: 'API Docs',       href: '/api-docs' },
]

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round">
      {open ? (
        <>
          <line x1="4" y1="4" x2="18" y2="18" />
          <line x1="18" y1="4" x2="4" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="6"  x2="19" y2="6"  />
          <line x1="3" y1="11" x2="19" y2="11" />
          <line x1="3" y1="16" x2="19" y2="16" />
        </>
      )}
    </svg>
  )
}

export default function Navigation() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav className="fixed top-0 w-full bg-gray-950/90 backdrop-blur border-b border-gray-800 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-cyan-400 font-bold text-lg tracking-widest select-none">
          SENTINEL
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-6">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm tracking-wide transition-colors ${
                isActive(item.href) ? 'text-cyan-400' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-gray-400 hover:text-gray-200 p-1 transition-colors"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <HamburgerIcon open={menuOpen} />
        </button>
      </div>

      {/* Mobile slide-down menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-gray-800 px-6 py-3 flex flex-col gap-1 bg-gray-950">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`text-left py-2.5 text-sm tracking-wide transition-colors border-b border-gray-800/50 last:border-0 ${
                isActive(item.href) ? 'text-cyan-400' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
