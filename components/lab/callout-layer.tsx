'use client'

import type { RefObject } from 'react'
import { getCalloutTexts } from '@/lib/i18n/content/callouts'
import { useI18n } from '@/lib/i18n/provider'
import type { LessonId } from '@/lib/lessons'
import { cn } from '@/lib/utils'
import { CalloutIconMark } from './callout-icon'
import type { CalloutSpec } from './three/parts'

/** Positions are written each frame via transform from the 3D scene — avoid React re-renders. */
export function CalloutLayer({
  lessonId,
  callouts,
  elementsRef,
  highlightIndex = null,
  onSelect,
}: {
  lessonId: LessonId
  callouts: CalloutSpec[]
  elementsRef: RefObject<(HTMLDivElement | null)[]>
  /** When set, that callout is emphasized and others are dimmed. */
  highlightIndex?: number | null
  /** Click a label to focus that part (same as mesh pick). */
  onSelect?: (calloutIndex: number) => void
}) {
  const { locale } = useI18n()
  const texts = getCalloutTexts(lessonId, locale)
  const focusing = highlightIndex != null

  return (
    <div className="callout-layer pointer-events-none absolute inset-0 overflow-hidden">
      {callouts.map((c, i) => {
        const left = c.dx < 0
        const text = texts[i] ?? { title: c.title, body: c.body }
        const active = highlightIndex === i
        const clickable = Boolean(onSelect && (c.pickable || c.interactive || c.controls || c.control || c.icon))
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
            <svg className="absolute overflow-visible" width="1" height="1" aria-hidden>
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
              aria-hidden
            />
            <button
              type="button"
              disabled={!clickable}
              onClick={() => onSelect?.(i)}
              className={cn(
                'absolute w-40 -translate-y-1/2 rounded-md border bg-card/95 px-3 py-2 text-left shadow-sm backdrop-blur-sm transition',
                left && '-translate-x-full',
                c.interactive && 'border-accent',
                active && 'z-10 w-48 scale-110 border-accent bg-card shadow-md',
                clickable && 'pointer-events-auto cursor-pointer hover:border-accent hover:shadow-md',
                !clickable && 'pointer-events-none',
              )}
              style={{ left: c.dx, top: c.dy }}
            >
              <div className="flex items-start gap-1.5">
                {c.icon ? <CalloutIconMark icon={c.icon} className="mt-0.5 text-accent" /> : null}
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-tight text-foreground">{text.title}</p>
                  <p className="mt-0.5 hidden text-xs leading-snug text-muted-foreground md:block">{text.body}</p>
                </div>
              </div>
            </button>
          </div>
        )
      })}
    </div>
  )
}
