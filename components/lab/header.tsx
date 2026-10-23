'use client'

import { BookOpen } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { LocaleSwitcher } from '@/components/site/locale-switcher'
import { ThemeSwitcher } from '@/components/site/theme-switcher'
import type { LessonRecord } from '@/lib/advanced-types'
import { TRACKS, trackProgress } from '@/lib/curriculum'
import { useI18n } from '@/lib/i18n/provider'

const TRACK_TITLE_KEY: Record<string, string> = {
  foundations: 'tracks.foundationsTitle',
  build: 'tracks.buildTitle',
  engineering: 'tracks.engineeringTitle',
  product: 'tracks.productTitle',
}

export function Header({
  done,
  total,
  advanced,
  advancedRecords,
  onToggleAdvanced,
}: {
  done: number
  total: number
  advanced: boolean
  advancedRecords: Record<string, LessonRecord>
  onToggleAdvanced: () => void
}) {
  const { t } = useI18n()

  return (
    <header className="relative z-40 flex items-center justify-between gap-4 border-b border-border bg-[color:var(--glass)] px-4 py-3 shadow-[var(--soft-shadow)] backdrop-blur-xl lg:px-6">
      <Link href="/" className="flex min-w-0 items-center gap-3">
        <Image
          src="/logo.svg"
          alt=""
          width={40}
          height={40}
          className="size-10 rounded-[0.9rem] shadow-[var(--soft-shadow)] ring-1 ring-border"
          priority
        />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-extrabold tracking-[-0.03em] text-foreground md:text-[1.65rem]">
            {t('brand.title')}{' '}
            <span className="font-mono text-xs font-medium tracking-normal text-muted-foreground">/ {t('brand.subtitle')}</span>
          </h1>
          <p className="hidden whitespace-nowrap font-mono text-[10px] tracking-[0.22em] text-muted-foreground sm:block">
            {t('brand.path')}
          </p>
        </div>
      </Link>
      <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
        <button onClick={onToggleAdvanced} className="ui-chip">
          {advanced ? t('header.backBasics') : t('header.enterAdvanced')}
        </button>
        <ThemeSwitcher />
        <LocaleSwitcher />
        <div className="ui-chip gap-2 !py-1.5 sm:gap-3">
          <BookOpen className="size-4 text-primary sm:size-[1.05rem]" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <span className="hidden text-[11px] font-semibold sm:block">{advanced ? t('header.tracks') : t('header.basics')}</span>
            {advanced ? (
              <div className="flex gap-2">
                {TRACKS.map((track) => {
                  const progress = trackProgress(track.id, advancedRecords, done, total)
                  const title = TRACK_TITLE_KEY[track.id] ? t(TRACK_TITLE_KEY[track.id]) : track.title
                  return (
                    <div key={track.id} className="hidden sm:block" title={title}>
                      <div className="h-1.5 w-10 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className="h-1.5 w-20 overflow-hidden rounded-full bg-muted md:w-28"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-valuenow={done}
                  aria-label={t('header.progress')}
                >
                  <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(done / total) * 100}%` }} />
                </div>
                <span className="font-mono text-xs font-bold tabular-nums">
                  {done}/{total}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
