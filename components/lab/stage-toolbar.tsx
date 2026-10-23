'use client'

import { Box, CircuitBoard, Locate, Move, Package, RotateCcw, RotateCw, Tag, ZoomIn, ZoomOut } from 'lucide-react'
import type { RefObject } from 'react'
import { useI18n } from '@/lib/i18n/provider'
import { cn } from '@/lib/utils'
import type { ViewApi } from './three/scene'

export type StageViewMode = 'scene' | 'schematic' | 'pinout'

type Props = {
  viewRef: RefObject<ViewApi | null>
  showLabels: boolean
  onToggleLabels: () => void
  showParts: boolean
  onToggleParts: () => void
  mode?: StageViewMode
  onModeChange?: (mode: StageViewMode) => void
  /** When false, hide pan buttons (e.g. 2D diagram modes use PanZoomStage). */
  showCameraControls?: boolean
}

export function StageToolbar({
  viewRef,
  showLabels,
  onToggleLabels,
  showParts,
  onToggleParts,
  mode = 'scene',
  onModeChange,
  showCameraControls = true,
}: Props) {
  const { t } = useI18n()
  const btn =
    'flex size-8 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted aria-pressed:bg-foreground aria-pressed:text-background'
  const onScene = mode === 'scene'

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center gap-2">
      {onScene && (
        <p className="hidden rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background md:block">{t('stage.rotateHint')}</p>
      )}
      <div role="toolbar" aria-label={t('stage.viewControls')} className="pointer-events-auto flex flex-wrap items-center justify-center gap-0.5 rounded-lg border bg-card p-1 shadow-sm">
        {onModeChange && (
          <>
            <button className={cn(btn)} onClick={() => onModeChange('scene')} aria-pressed={mode === 'scene'} aria-label={t('stage.breadboard')}>
              <Box className="size-4" />
            </button>
            <button className={cn(btn)} onClick={() => onModeChange('schematic')} aria-pressed={mode === 'schematic'} aria-label={t('stage.schematic')}>
              <CircuitBoard className="size-4" />
            </button>
            <button className={cn(btn)} onClick={() => onModeChange('pinout')} aria-pressed={mode === 'pinout'} aria-label={t('stage.pinout')}>
              <span className="font-mono text-[10px] font-black leading-none">IO</span>
            </button>
            <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
          </>
        )}

        {showCameraControls && onScene && (
          <>
            <button className={btn} onClick={() => viewRef.current?.pan(-0.7, 0)} aria-label={t('stage.panLeft')}>
              <Move className="size-4 -scale-x-100" />
            </button>
            <button className={btn} onClick={() => viewRef.current?.pan(0.7, 0)} aria-label={t('stage.panRight')}>
              <Move className="size-4" />
            </button>
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
          </>
        )}

        {onScene && (
          <>
            <button className={cn(btn)} onClick={onToggleLabels} aria-pressed={showLabels} aria-label={t('stage.labels')}>
              <Tag className="size-4" />
            </button>
            <button className={cn(btn)} onClick={onToggleParts} aria-pressed={showParts} aria-label={t('stage.parts')}>
              <Package className="size-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
