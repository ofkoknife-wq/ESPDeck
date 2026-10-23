'use client'

import { Crosshair } from 'lucide-react'
import { useMemo } from 'react'
import { useI18n } from '@/lib/i18n/provider'
import type { LessonId } from '@/lib/lessons'
import { cn } from '@/lib/utils'
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
      className="pointer-events-auto absolute left-3 top-3 z-20 flex max-h-[min(22rem,55%)] w-[min(17.5rem,calc(100%-1.5rem))] flex-col overflow-hidden rounded-2xl border border-[#e1e5eb] bg-[#fffffe]/95 shadow-[0_12px_32px_rgb(31_41_55/14%)] backdrop-blur-md"
      aria-label={t('stage.partsTitle')}
    >
      <div className="flex items-baseline justify-between gap-2 border-b border-[#e8ebe6] px-3.5 py-2.5">
        <h3 className="text-sm font-black tracking-tight text-[#020826]">{t('stage.partsTitle')}</h3>
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
                focusedKey === part.key ? 'bg-[#eaddcf]' : 'hover:bg-[#f4eee6]',
                part.interactive && 'ring-1 ring-inset ring-accent/35',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-[#e1e5eb] bg-white text-[#8c7851]',
                  focusedKey === part.key && 'border-[#020826] bg-[#020826] text-white',
                )}
                aria-hidden
              >
                <Crosshair className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold text-[#020826]">{part.title}</span>
                <span className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">{part.body}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
