'use client'

import { Locate, RotateCcw, RotateCw, Tag, ZoomIn, ZoomOut } from 'lucide-react'
import type { RefObject } from 'react'
import { useI18n } from '@/lib/i18n/provider'
import { cn } from '@/lib/utils'
import type { ViewApi } from './three/scene'

type Props = {
  viewRef: RefObject<ViewApi | null>
  showLabels: boolean
  onToggleLabels: () => void
}

export function StageToolbar({ viewRef, showLabels, onToggleLabels }: Props) {
  const { t } = useI18n()
  const btn =
    'flex size-8 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted aria-pressed:bg-foreground aria-pressed:text-background'
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center gap-2">
      <p className="hidden rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background md:block">{t('stage.rotateHint')}</p>
      <div role="toolbar" aria-label={t('stage.viewControls')} className="pointer-events-auto flex items-center gap-0.5 rounded-lg border bg-card p-1 shadow-sm">
        <button className={btn} onClick={() => viewRef.current?.rotate(1)} aria-label={t('stage.rotateLeft')}>
          <RotateCcw className="size-4" />
        </button>
        <button className={btn} onClick={() => viewRef.current?.rotate(-1)} aria-label={t('stage.rotateRight')}>
          <RotateCw className="size-4" />
        </button>
        <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
        <button className={btn} onClick={() => viewRef.current?.zoom(-1)} aria-label={t('stage.zoomOut')}>
          <ZoomOut className="size-4" />
        </button>
        <button className={btn} onClick={() => viewRef.current?.zoom(1)} aria-label={t('stage.zoomIn')}>
          <ZoomIn className="size-4" />
        </button>
        <button className={btn} onClick={() => viewRef.current?.reset()} aria-label={t('stage.reset')}>
          <Locate className="size-4" />
        </button>
        <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
        <button className={cn(btn)} onClick={onToggleLabels} aria-pressed={showLabels} aria-label={t('stage.labels')}>
          <Tag className="size-4" />
        </button>
      </div>
    </div>
  )
}
