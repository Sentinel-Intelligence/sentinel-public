import type { Metadata } from 'next'
import { Instrument_Serif, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Sentinel Intelligence',
  url: 'https://sentinelintel.org',
  logo: 'https://sentinelintel.org/og-image.png',
  description: 'The largest open graph of congressional influence ever built. Mapping political finance, insider trading, lobbying, and dark money flows.',
  sameAs: [
    'https://github.com/Sentinel-Intelligence/sentinel-public',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'api@sentinelintel.org',
    contactType: 'customer support',
  },
}

const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-instrument-serif',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://sentinelintel.org'),
  title: 'Sentinel Intelligence: Congressional Influence Graph & Political Finance Data',
  description: 'The largest open graph of congressional influence ever built. Mapping political finance, insider trading, lobbying, and dark money flows across 463K entities and 7.3M connections.',
  alternates: {
    canonical: 'https://sentinelintel.org',
  },
  openGraph: {
    title: 'Sentinel Intelligence: Congressional Influence Graph & Political Finance Data',
    description: 'The largest open graph of congressional influence ever built. Mapping political finance, insider trading, lobbying, and dark money flows.',
    images: [{ url: '/og-image.png' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sentinel Intelligence: Congressional Influence Graph & Political Finance Data',
    description: 'The largest open graph of congressional influence ever built. Mapping political finance, insider trading, lobbying, and dark money flows.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-gray-950">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`${instrumentSerif.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-mono antialiased bg-gray-950 text-gray-100`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker'in navigator){navigator.serviceWorker.getRegistrations().then(function(r){for(let reg of r){reg.unregister()}})}`,
          }}
        />
        <Navigation />
        <main className="pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
