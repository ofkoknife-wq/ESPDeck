import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono, Noto_Sans_SC } from 'next/font/google'
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
  metadataBase: new URL('https://espdeck.pixzens.com'),
  title: {
    default: 'ESPDeck · ESP32 实验室',
    template: '%s',
  },
  description:
    '硬件看起来很吓人，直到你把它拆成小步骤。给新手练手的 ESP32 实验室：3D 电路、原理图、PCB，一次只走一小步。',
  applicationName: 'ESPDeck',
  authors: [{ name: 'Pixzens', url: 'https://espdeck.pixzens.com' }],
  openGraph: {
    title: 'ESPDeck · ESP32 实验室',
    description: '硬件看起来很吓人，直到你把它拆成小步骤。',
    url: 'https://espdeck.pixzens.com',
    siteName: 'ESPDeck',
    locale: 'zh_CN',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#e6ebe4',
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
