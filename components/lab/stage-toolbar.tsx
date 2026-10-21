'use client'

import { Locate, RotateCcw, RotateCw, Tag, ZoomIn, ZoomOut } from 'lucide-react'
import type { RefObject } from 'react'
import { cn } from '@/lib/utils'
import type { ViewApi } from './three/scene'

type Props = {
  viewRef: RefObject<ViewApi | null>
  showLabels: boolean
  onToggleLabels: () => void
}

export function StageToolbar({ viewRef, showLabels, onToggleLabels }: Props) {
  const btn =
    'flex size-8 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted aria-pressed:bg-foreground aria-pressed:text-background'
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center gap-2">
      <p className="hidden rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background md:block">
        拖动旋转 · 右键平移 · 滚轮缩放
      </p>
      <div
        role="toolbar"
        aria-label="视图控制"
        className="pointer-events-auto flex items-center gap-0.5 rounded-lg border bg-card p-1 shadow-sm"
      >
        <button className={btn} onClick={() => viewRef.current?.rotate(1)} aria-label="向左旋转">
          <RotateCcw className="size-4" />
        </button>
        <button className={btn} onClick={() => viewRef.current?.rotate(-1)} aria-label="向右旋转">
          <RotateCw className="size-4" />
        </button>
        <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
        <button className={btn} onClick={() => viewRef.current?.zoom(-1)} aria-label="缩小">
          <ZoomOut className="size-4" />
        </button>
        <button className={btn} onClick={() => viewRef.current?.zoom(1)} aria-label="放大">
          <ZoomIn className="size-4" />
        </button>
        <button className={btn} onClick={() => viewRef.current?.reset()} aria-label="重置视角">
          <Locate className="size-4" />
        </button>
        <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
        <button
          className={cn(btn)}
          onClick={onToggleLabels}
          aria-pressed={showLabels}
          aria-label="显示标注"
        >
          <Tag className="size-4" />
        </button>
      </div>
    </div>
  )
}
