import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono, Noto_Sans_SC } from 'next/font/google'
import { Providers } from '@/components/site/providers'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import './globals.css'

const SITE_TAGLINE_EN = 'Open the page. Get hands-on with ESP32.'

const notoSansSC = Noto_Sans_SC({
  weight: ['400', '500', '700', '900'],
  variable: '--font-noto-sc',
  preload: false,
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · ESP32 Lab`,
    template: '%s',
  },
  description: `${SITE_TAGLINE_EN} Interactive 3D lessons and an advanced station: blink, sensors, schematics, PCB—one idea per lesson.`,
  applicationName: SITE_NAME,
  authors: [{ name: 'Pixzens', url: SITE_URL }],
  keywords: ['ESP32', 'ESPDeck', 'embedded', 'IoT', 'Arduino', 'hardware lab', 'schematic', 'PCB'],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    other: [
      { rel: 'android-chrome', url: '/android-chrome-192x192.png' },
      { rel: 'android-chrome', url: '/android-chrome-512x512.png' },
    ],
  },
  openGraph: {
    title: `${SITE_NAME} · ESP32 Lab`,
    description: SITE_TAGLINE_EN,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_US',
    alternateLocale: ['zh_CN'],
    type: 'website',
    images: [
      {
        url: '/og-image.svg',
        width: 1280,
        height: 720,
        alt: 'ESPDeck — ESP32 Lab',
      },
      {
        url: '/logo.png',
        width: 1000,
        height: 1000,
        alt: 'ESPDeck logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} · ESP32 Lab`,
    description: SITE_TAGLINE_EN,
    images: ['/og-image.svg'],
  },
  alternates: {
    canonical: SITE_URL,
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#f9f4ef',
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`bg-background ${notoSansSC.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </Providers>
      </body>
    </html>
  )
}
