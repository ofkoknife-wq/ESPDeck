'use client'

import { Crosshair } from 'lucide-react'
import { useMemo } from 'react'
import { useI18n } from '@/lib/i18n/provider'
import type { LessonId } from '@/lib/lessons'
import { cn } from '@/lib/utils'
import { CalloutIconMark } from './callout-icon'
import { getSceneParts, type ScenePart } from './scene-parts'

type Props = {
  lessonId: LessonId
  open: boolean
  focusedKey: string | null
  onFocus: (part: ScenePart) => void
}

export function ScenePartsPanel({ lessonId, open, focusedKey, onFocus }: Props) {
  const { t, locale } = useI18n()
  const parts = useMemo(
    () =>
      getSceneParts(lessonId, locale, {
        partBoard: t('stage.partBoard'),
        partBoardBody: t('stage.partBoardBody'),
        partBreadboard: t('stage.partBreadboard'),
        partBreadboardBody: t('stage.partBreadboardBody'),
      }),
    [lessonId, locale, t],
  )

  if (!open || parts.length === 0) return null

  return (
    <aside
      className="pointer-events-auto absolute left-3 top-3 z-20 flex max-h-[min(22rem,55%)] w-[min(17.5rem,calc(100%-1.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-[color:var(--glass)] shadow-[var(--elevated-shadow)] backdrop-blur-xl"
      aria-label={t('stage.partsTitle')}
    >
      <div className="flex items-baseline justify-between gap-2 border-b border-border px-3.5 py-2.5">
        <h3 className="text-sm font-extrabold tracking-tight text-foreground">{t('stage.partsTitle')}</h3>
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {t('stage.partsInView', { n: parts.length })}
        </p>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5">
        {parts.map((part) => (
          <li key={`${lessonId}-${part.key}`}>
            <button
              type="button"
              onClick={() => onFocus(part)}
              aria-label={t('stage.focusPart', { name: part.title })}
              aria-pressed={focusedKey === part.key}
              className={cn(
                'flex w-full items-start gap-2.5 rounded-xl px-2 py-2 text-left transition',
                focusedKey === part.key ? 'bg-secondary' : 'hover:bg-muted/80',
                part.interactive && 'ring-1 ring-inset ring-accent/35',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-primary',
                  focusedKey === part.key && 'border-foreground bg-foreground text-background',
                )}
                aria-hidden
              >
                {part.icon ? <CalloutIconMark icon={part.icon} className="size-3.5" /> : <Crosshair className="size-3.5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold text-foreground">{part.title}</span>
                <span className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">{part.body}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
