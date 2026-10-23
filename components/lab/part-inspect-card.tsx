'use client'

import { Search, X } from 'lucide-react'
import type { RefObject } from 'react'
import { useI18n } from '@/lib/i18n/provider'
import type { ScenePart } from './scene-parts'
import type { ViewApi } from './three/scene'

/** Leader length — keep the card clear of the focused mesh (reference-style). */
const DX = 150
const DY = -110

type Props = {
  part: ScenePart | null
  viewRef: RefObject<ViewApi | null>
  elRef: RefObject<HTMLDivElement | null>
  onClose: () => void
}

/** Screen-space card projected onto the focused component (position written each frame). */
export function PartInspectCard({ part, viewRef, elRef, onClose }: Props) {
  const { t } = useI18n()

  return (
    <div
      ref={elRef}
      className="pointer-events-none absolute left-0 top-0 z-30 opacity-0 transition-opacity duration-200"
      aria-hidden={!part}
    >
      <span className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_6px_rgb(14_124_123/28%)]" />
      <span className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-accent/50" />
      {part && (
        <>
          <svg className="absolute overflow-visible" width="1" height="1" aria-hidden>
            <line
              x1="0"
              y1="0"
              x2={DX}
              y2={DY}
              stroke="var(--foreground)"
              strokeOpacity="0.55"
              strokeWidth="1.25"
              strokeDasharray="4 4"
            />
          </svg>
          <div
            className="pointer-events-auto absolute w-[min(16.5rem,calc(100vw-6rem))] -translate-y-1/2 rounded-2xl border border-[#e1e5eb] bg-[#fffffe] p-3 shadow-[0_16px_40px_rgb(31_41_55/18%)]"
            style={{ left: DX, top: DY }}
          >
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black leading-tight text-[#020826]">{part.title}</h3>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{part.body}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-[#e1e5eb] text-muted-foreground transition hover:bg-[#f4eee6] hover:text-foreground"
                aria-label={t('stage.closeInspect')}
              >
                <X className="size-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => viewRef.current?.focusAt(part.at, { inspect: true })}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#020826] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#1a2744]"
            >
              <Search className="size-3.5" aria-hidden />
              {t('stage.inspect')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
