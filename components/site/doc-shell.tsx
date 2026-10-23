import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { SiteFooter } from './site-footer'

export function DocShell({ children }: { children: ReactNode }) {
  return (
    <div className="lab-shell flex min-h-dvh flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-[#e1e5eb] bg-white/95 px-4 py-3 shadow-[0_2px_14px_rgb(31_41_55/6%)] backdrop-blur lg:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image src="/logo.svg" alt="" width={40} height={40} className="size-10 rounded-2xl" priority />
          <div className="min-w-0">
            <p className="truncate text-lg font-black tracking-tight text-[#1d1d1f] md:text-2xl">
              ESP32 实验室 <span className="font-mono text-xs font-normal tracking-normal text-[#2a2a2a]">/ 实验系统</span>
            </p>
            <p className="hidden font-mono text-xs tracking-[0.3em] text-muted-foreground sm:block">零基础 · 能做项目 · 工程化 · 产品级</p>
          </div>
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-[#e1e5eb] bg-white px-3 py-2 text-xs font-bold text-[#020826] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#eaddcf]"
        >
          回到实验台
        </Link>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-6">{children}</main>
      <SiteFooter />
    </div>
  )
}
