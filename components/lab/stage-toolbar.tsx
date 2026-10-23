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
  const onScene = mode === 'scene'

  const toolBtn =
    'flex size-8 items-center justify-center rounded-xl text-[color:var(--ink-soft)] transition hover:bg-muted hover:text-foreground'
  const toggleBtn = (pressed: boolean) =>
    cn(
      'flex size-8 items-center justify-center rounded-xl transition',
      pressed
        ? 'bg-primary text-primary-foreground'
        : 'text-[color:var(--ink-soft)] hover:bg-muted hover:text-foreground',
    )

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center gap-2">
      {onScene && (
        <p className="hidden rounded-full border border-border bg-[color:var(--glass)] px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-[var(--soft-shadow)] backdrop-blur-md md:block">
          {t('stage.rotateHint')}
        </p>
      )}
      <div
        role="toolbar"
        aria-label={t('stage.viewControls')}
        className="pointer-events-auto flex flex-wrap items-center justify-center gap-0.5 rounded-2xl border border-border bg-[color:var(--glass)] p-1 shadow-[var(--soft-shadow)] backdrop-blur-xl"
      >
        {onModeChange && (
          <>
            <button
              type="button"
              className={toggleBtn(mode === 'scene')}
              onClick={() => onModeChange('scene')}
              aria-pressed={mode === 'scene'}
              aria-label={t('stage.breadboard')}
            >
              <Box className="size-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              className={toggleBtn(mode === 'schematic')}
              onClick={() => onModeChange('schematic')}
              aria-pressed={mode === 'schematic'}
              aria-label={t('stage.schematic')}
            >
              <CircuitBoard className="size-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              className={toggleBtn(mode === 'pinout')}
              onClick={() => onModeChange('pinout')}
              aria-pressed={mode === 'pinout'}
              aria-label={t('stage.pinout')}
            >
              <span className="font-mono text-[10px] font-black leading-none">IO</span>
            </button>
            <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
          </>
        )}

        {showCameraControls && onScene && (
          <>
            <button type="button" className={toolBtn} onClick={() => viewRef.current?.pan(-0.7, 0)} aria-label={t('stage.panLeft')}>
              <Move className="size-4 -scale-x-100" strokeWidth={1.75} />
            </button>
            <button type="button" className={toolBtn} onClick={() => viewRef.current?.pan(0.7, 0)} aria-label={t('stage.panRight')}>
              <Move className="size-4" strokeWidth={1.75} />
            </button>
            <button type="button" className={toolBtn} onClick={() => viewRef.current?.rotate(1)} aria-label={t('stage.rotateLeft')}>
              <RotateCcw className="size-4" strokeWidth={1.75} />
            </button>
            <button type="button" className={toolBtn} onClick={() => viewRef.current?.rotate(-1)} aria-label={t('stage.rotateRight')}>
              <RotateCw className="size-4" strokeWidth={1.75} />
            </button>
            <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
            <button type="button" className={toolBtn} onClick={() => viewRef.current?.zoom(-1)} aria-label={t('stage.zoomOut')}>
              <ZoomOut className="size-4" strokeWidth={1.75} />
            </button>
            <button type="button" className={toolBtn} onClick={() => viewRef.current?.zoom(1)} aria-label={t('stage.zoomIn')}>
              <ZoomIn className="size-4" strokeWidth={1.75} />
            </button>
            <button type="button" className={toolBtn} onClick={() => viewRef.current?.reset()} aria-label={t('stage.reset')}>
              <Locate className="size-4" strokeWidth={1.75} />
            </button>
            <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
          </>
        )}

        {onScene && (
          <>
            <button
              type="button"
              className={toggleBtn(showLabels)}
              onClick={onToggleLabels}
              aria-pressed={showLabels}
              aria-label={t('stage.labels')}
            >
              <Tag className="size-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              className={toggleBtn(showParts)}
              onClick={onToggleParts}
              aria-pressed={showParts}
              aria-label={t('stage.parts')}
            >
              <Package className="size-4" strokeWidth={1.75} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
