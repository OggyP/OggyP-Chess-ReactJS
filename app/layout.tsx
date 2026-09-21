import type { Metadata, Viewport } from 'next'
import NavBar from '@/src/NavBar'
import '@/src/css/all.scss'
import '@/src/css/normalise.scss'

export const metadata: Metadata = {
  metadataBase: new URL('https://chess.oggyp.com'),
  title: 'OggyP Chess',
  description: 'A worse version of Lichess but it is unblocked on school WiFi. (It is a feature)',
  keywords: ['chess', 'enpassant', 'oggyp', 'jam'],
  authors: [
    { name: 'Oscar Pritchard' },
    { name: 'Kaelan Carlos' },
    { name: 'Ewan Odenthal' },
  ],
  openGraph: {
    title: 'OggyP Chess',
    description: 'A worse version of Lichess but it is unblocked on school WiFi. (It is a feature)',
    url: 'https://chess.oggyp.com',
    siteName: 'OggyP Chess',
    images: ['/logo512.png'],
  },
  icons: {
    icon: [
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/favicon/apple-touch-icon.png',
    shortcut: '/favicon/favicon.ico',
  },
  manifest: '/favicon/site.webmanifest',
  other: {
    'msapplication-TileColor': '#da532c',
    'msapplication-config': '/favicon/browserconfig.xml',
  },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#ff1500" />
        <link rel="stylesheet" href="https://cdn.oggyp.com/fonts/DMSans/DMSans.css" crossOrigin="" />
        <link rel="stylesheet" href="https://cdn.oggyp.com/fonts/DMMono/DMMono.css" crossOrigin="" />
        <link rel="stylesheet" href="https://cdn.oggyp.com/fonts/CoreSansC/CoreSansC.css" crossOrigin="" />
        <link rel="stylesheet" href="https://cdn.oggyp.com/fonts/Jost/Jost.css" crossOrigin="" />
        <link rel="stylesheet" href="/assets/css/MaterialSymbolsRounded.css" />
        <link rel="stylesheet" href="/assets/css/MaterialIconsSharp.css" />
        <link rel="stylesheet" href="/assets/css/MaterialIconsRound.css" />
      </head>
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  )
}
