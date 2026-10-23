'use client'

import { Crosshair } from 'lucide-react'
import type { RefObject } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { BOARD_X, BB_TOP, PCB_TOP } from '@/lib/geometry'
import { getCalloutTexts } from '@/lib/i18n/content/callouts'
import { useI18n } from '@/lib/i18n/provider'
import type { LessonId } from '@/lib/lessons'
import { cn } from '@/lib/utils'
import { LESSON_SCENES } from './three/circuits'
import type { ViewApi } from './three/scene'

type Props = {
  lessonId: LessonId
  viewRef: RefObject<ViewApi | null>
  open: boolean
}

type PartRow = {
  key: string
  title: string
  body: string
  at: [number, number, number]
  interactive?: boolean
}

export function ScenePartsPanel({ lessonId, viewRef, open }: Props) {
  const { t, locale } = useI18n()
  const scene = LESSON_SCENES[lessonId]
  const texts = useMemo(() => getCalloutTexts(lessonId, locale), [lessonId, locale])
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    setActive(null)
  }, [lessonId])

  const parts = useMemo(() => {
    const rows: PartRow[] = []
    const ox = scene.offsetX

    if (lessonId !== 'board') {
      rows.push({
        key: 'board',
        title: t('stage.partBoard'),
        body: t('stage.partBoardBody'),
        at: [BOARD_X + ox, PCB_TOP + 0.2, 0],
      })
    }
    if (scene.breadboard) {
      rows.push({
        key: 'breadboard',
        title: t('stage.partBreadboard'),
        body: t('stage.partBreadboardBody'),
        at: [ox, BB_TOP + 0.15, 0],
      })
    }

    scene.callouts.forEach((callout, index) => {
      const text = texts[index] ?? { title: callout.title, body: callout.body }
      rows.push({
        key: `callout-${index}`,
        title: text.title,
        body: text.body,
        at: [callout.at[0] + ox, callout.at[1], callout.at[2]],
        interactive: Boolean(callout.interactive),
      })
    })

    return rows
  }, [lessonId, scene, t, texts])

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
              onClick={() => {
                setActive(part.key)
                viewRef.current?.focusAt(part.at)
              }}
              aria-label={t('stage.focusPart', { name: part.title })}
              className={cn(
                'flex w-full items-start gap-2.5 rounded-xl px-2 py-2 text-left transition',
                active === part.key ? 'bg-[#eaddcf]' : 'hover:bg-[#f4eee6]',
                part.interactive && 'ring-1 ring-inset ring-accent/35',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-[#e1e5eb] bg-white text-[#8c7851]',
                  active === part.key && 'border-[#020826] bg-[#020826] text-white',
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
