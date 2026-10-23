'use client'

import { useI18n } from '@/lib/i18n/provider'

type Props = {
  index: number
  total: number
  title: string
}

/** Floating title chip inside the stage — keeps the header clear. */
export function StageTitleBar({ index, total, title }: Props) {
  const { t } = useI18n()

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center px-3 pt-3 sm:justify-end sm:px-4 sm:pt-3.5">
      <div className="pointer-events-auto flex max-w-[min(100%,28rem)] items-center gap-3 rounded-2xl border border-border bg-[color:var(--glass)] px-3.5 py-2 shadow-[var(--soft-shadow)] backdrop-blur-xl">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
              {t('lab.lessonOf', {
                current: String(index + 1).padStart(2, '0'),
                total: String(total).padStart(2, '0'),
              })}
            </p>
            <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline" aria-hidden>
              ·
            </span>
            <p className="hidden font-mono text-[10px] text-muted-foreground sm:inline">{t('lab.systemReady')}</p>
          </div>
          <h2 className="truncate text-sm font-extrabold tracking-tight text-foreground sm:text-[0.95rem]">{title}</h2>
        </div>
      </div>
    </div>
  )
}
