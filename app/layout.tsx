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
  title: 'ESP32 实验室 · 一步一步学硬件',
  description:
    '硬件看起来很吓人，直到你把它拆成小步骤。交互式 3D 中文课程，一次带你完成一个 ESP32 电路：点灯、按钮、电位器、触摸、温湿度、蜂鸣器、舵机和 Wi-Fi。',
  generator: 'v0.app',
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
