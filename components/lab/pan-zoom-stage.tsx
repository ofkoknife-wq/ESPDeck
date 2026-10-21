'use client'

import { Locate, ZoomIn, ZoomOut } from 'lucide-react'
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

const MIN = 0.45
const MAX = 5
const STEP = 1.22

export function PanZoomStage({ children, hint }: { children: ReactNode; hint: string }) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const wrapRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; panX: number; panY: number; moved: boolean } | null>(null)
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map())
  const pinch = useRef<{ dist: number; zoom: number } | null>(null)
  const skipClick = useRef(false)

  const clampZoom = (value: number) => Math.min(MAX, Math.max(MIN, value))

  const zoomAt = useCallback((nextZoom: number, cx: number, cy: number) => {
    setZoom((prev) => {
      const next = clampZoom(nextZoom)
      const factor = next / prev
      setPan((p) => ({ x: cx - (cx - p.x) * factor, y: cy - (cy - p.y) * factor }))
      return next
    })
  }, [])

  const zoomBy = (dir: 1 | -1) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    const cx = rect ? rect.width / 2 : 0
    const cy = rect ? rect.height / 2 : 0
    zoomAt(zoom * (dir > 0 ? STEP : 1 / STEP), cx, cy)
  }

  const reset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const rect = el.getBoundingClientRect()
      zoomAt(zoom * (event.deltaY < 0 ? STEP : 1 / STEP), event.clientX - rect.left, event.clientY - rect.top)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoom, zoomAt])

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full touch-none overflow-hidden bg-[#efe6d8]"
      onPointerDown={(event) => {
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
        if (pointers.current.size === 2) {
          const [a, b] = [...pointers.current.values()]
          pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom }
          drag.current = null
          return
        }
        wrapRef.current?.setPointerCapture(event.pointerId)
        drag.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y, moved: false }
      }}
      onPointerMove={(event) => {
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
        if (pointers.current.size === 2 && pinch.current) {
          const [a, b] = [...pointers.current.values()]
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          const rect = wrapRef.current?.getBoundingClientRect()
          zoomAt((pinch.current.zoom * dist) / pinch.current.dist, rect ? rect.width / 2 : 0, rect ? rect.height / 2 : 0)
          return
        }
        const d = drag.current
        if (!d) return
        const dx = event.clientX - d.x
        const dy = event.clientY - d.y
        if (Math.hypot(dx, dy) > 4) d.moved = true
        if (d.moved) setPan({ x: d.panX + dx, y: d.panY + dy })
      }}
      onPointerUp={(event) => {
        if (drag.current?.moved) skipClick.current = true
        pointers.current.delete(event.pointerId)
        pinch.current = null
        drag.current = null
      }}
      onClickCapture={(event) => {
        if (!skipClick.current) return
        skipClick.current = false
        event.stopPropagation()
        event.preventDefault()
      }}
      onPointerCancel={() => {
        pointers.current.clear()
        pinch.current = null
        drag.current = null
      }}
      onDoubleClick={reset}
    >
      <div
        className="h-full w-full origin-top-left will-change-transform"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
      >
        {children}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center gap-2">
        <p className="hidden rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background md:block">{hint}</p>
        <div
          role="toolbar"
          aria-label="视图控制"
          className="pointer-events-auto flex items-center gap-0.5 rounded-lg border bg-card p-1 shadow-sm"
        >
          <button className="flex size-8 items-center justify-center rounded-md hover:bg-muted" onClick={() => zoomBy(-1)} aria-label="缩小">
            <ZoomOut className="size-4" />
          </button>
          <button className="flex size-8 items-center justify-center rounded-md hover:bg-muted" onClick={() => zoomBy(1)} aria-label="放大">
            <ZoomIn className="size-4" />
          </button>
          <button className="flex size-8 items-center justify-center rounded-md hover:bg-muted" onClick={reset} aria-label="重置视角">
            <Locate className="size-4" />
          </button>
          <span className="px-2 font-mono text-[10px] text-muted-foreground">{Math.round(zoom * 100)}%</span>
        </div>
      </div>
    </div>
  )
}
