'use client'

import type { RefObject } from 'react'
import { getCalloutTexts } from '@/lib/i18n/content/callouts'
import { useI18n } from '@/lib/i18n/provider'
import type { LessonId } from '@/lib/lessons'
import { cn } from '@/lib/utils'
import type { CalloutSpec } from './three/parts'

/** Positions are written each frame via transform from the 3D scene — avoid React re-renders. */
export function CalloutLayer({
  lessonId,
  callouts,
  elementsRef,
  highlightIndex = null,
}: {
  lessonId: LessonId
  callouts: CalloutSpec[]
  elementsRef: RefObject<(HTMLDivElement | null)[]>
  /** When set, that callout is emphasized and others are dimmed. */
  highlightIndex?: number | null
}) {
  const { locale } = useI18n()
  const texts = getCalloutTexts(lessonId, locale)
  const focusing = highlightIndex != null

  return (
    <div className="callout-layer pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {callouts.map((c, i) => {
        const left = c.dx < 0
        const text = texts[i] ?? { title: c.title, body: c.body }
        const active = highlightIndex === i
        return (
          <div
            key={`${lessonId}-${i}`}
            ref={(el) => {
              elementsRef.current[i] = el
            }}
            className={cn(
              'absolute left-0 top-0 opacity-0 transition-opacity duration-300',
              focusing && !active && '[&>*]:opacity-25',
            )}
          >
            <svg className="absolute overflow-visible" width="1" height="1">
              <line
                x1="0"
                y1="0"
                x2={c.dx}
                y2={c.dy}
                stroke="var(--foreground)"
                strokeOpacity={active ? '0.75' : '0.45'}
                strokeWidth={active ? 1.5 : 1}
                strokeDasharray="3 3"
              />
            </svg>
            <span
              className={cn(
                'absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-4 ring-accent/25',
                active && 'size-3.5 ring-8 ring-accent/40',
              )}
            />
            <div
              className={cn(
                'absolute w-40 -translate-y-1/2 rounded-md border bg-card/95 px-3 py-2 shadow-sm backdrop-blur-sm transition',
                left && '-translate-x-full',
                c.interactive && 'border-accent',
                active && 'z-10 w-48 scale-110 border-accent bg-card shadow-md',
              )}
              style={{ left: c.dx, top: c.dy }}
            >
              <p className="text-sm font-bold leading-tight text-foreground">{text.title}</p>
              <p className="mt-0.5 hidden text-xs leading-snug text-muted-foreground md:block">{text.body}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
