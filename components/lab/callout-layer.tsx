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
}: {
  lessonId: LessonId
  callouts: CalloutSpec[]
  elementsRef: RefObject<(HTMLDivElement | null)[]>
}) {
  const { locale } = useI18n()
  const texts = getCalloutTexts(lessonId, locale)

  return (
    <div className="callout-layer pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {callouts.map((c, i) => {
        const left = c.dx < 0
        const text = texts[i] ?? { title: c.title, body: c.body }
        return (
          <div
            key={`${lessonId}-${i}`}
            ref={(el) => {
              elementsRef.current[i] = el
            }}
            className="absolute left-0 top-0 opacity-0 transition-opacity duration-300"
          >
            <svg className="absolute overflow-visible" width="1" height="1">
              <line
                x1="0"
                y1="0"
                x2={c.dx}
                y2={c.dy}
                stroke="var(--foreground)"
                strokeOpacity="0.45"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            </svg>
            <span className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-4 ring-accent/25" />
            <div
              className={cn(
                'absolute w-40 -translate-y-1/2 rounded-md border bg-card/95 px-3 py-2 shadow-sm backdrop-blur-sm',
                left && '-translate-x-full',
                c.interactive && 'border-accent',
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
