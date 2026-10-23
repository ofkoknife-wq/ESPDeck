'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useI18n } from '@/lib/i18n/provider'
import { LocaleSwitcher } from './locale-switcher'
import { SiteFooter } from './site-footer'
import { ThemeSwitcher } from './theme-switcher'

export function DocShell({ children }: { children: ReactNode }) {
  const { t } = useI18n()
  return (
    <div className="lab-shell flex min-h-dvh flex-col">
      <header className="relative z-40 flex items-center justify-between gap-4 border-b border-border bg-[color:var(--glass)] px-4 py-3 shadow-[var(--soft-shadow)] backdrop-blur-xl lg:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image src="/logo.svg" alt="" width={40} height={40} className="size-10 rounded-[0.9rem] ring-1 ring-border" priority />
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold tracking-[-0.03em] text-foreground md:text-[1.65rem]">
              {t('brand.title')}{' '}
              <span className="font-mono text-xs font-medium tracking-normal text-muted-foreground">/ {t('brand.subtitle')}</span>
            </p>
            <p className="hidden font-mono text-[10px] tracking-[0.22em] text-muted-foreground sm:block">{t('brand.path')}</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <LocaleSwitcher />
          <Link href="/" className="ui-chip">
            {t('info.backLab')}
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-6">{children}</main>
      <SiteFooter />
    </div>
  )
}
