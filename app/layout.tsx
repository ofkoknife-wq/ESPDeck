import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono, Noto_Sans_SC } from 'next/font/google'
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/site'
import './globals.css'

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
    default: `${SITE_NAME} · ESP32 实验室`,
    template: '%s',
  },
  description: `${SITE_TAGLINE}。交互式 3D 课程与进阶工位：点灯、传感器、原理图、PCB，一课一件事。`,
  applicationName: SITE_NAME,
  authors: [{ name: 'Pixzens', url: SITE_URL }],
  keywords: ['ESP32', 'ESPDeck', '硬件入门', '嵌入式', '物联网', 'Arduino', '3D 实验台', '原理图'],
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
    title: `${SITE_NAME} · ESP32 实验室`,
    description: SITE_TAGLINE,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'zh_CN',
    type: 'website',
    images: [
      {
        url: '/og-image.svg',
        width: 1280,
        height: 720,
        alt: 'ESPDeck — ESP32 实验室',
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
    title: `${SITE_NAME} · ESP32 实验室`,
    description: SITE_TAGLINE,
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
    <html lang="zh-CN" className={`bg-background ${notoSansSC.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
