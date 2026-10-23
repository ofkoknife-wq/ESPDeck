'use client'

import { Locate, ZoomIn, ZoomOut } from 'lucide-react'
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useI18n } from '@/lib/i18n/provider'

const MIN = 0.45
const MAX = 5
const STEP = 1.22
const STAGE_WORLD = { w: 720, h: 420 }

type View = { x: number; y: number; zoom: number }

function clampZoom(value: number) {
  return Math.min(MAX, Math.max(MIN, value))
}

function viewSize(zoom: number) {
  return { w: STAGE_WORLD.w / zoom, h: STAGE_WORLD.h / zoom }
}

function clampPan(x: number, y: number, zoom: number) {
  const { w, h } = viewSize(zoom)
  const minX = Math.min(0, STAGE_WORLD.w - w)
  const maxX = Math.max(0, STAGE_WORLD.w - w)
  const minY = Math.min(0, STAGE_WORLD.h - h)
  const maxY = Math.max(0, STAGE_WORLD.h - h)
  return { x: Math.min(maxX, Math.max(minX, x)), y: Math.min(maxY, Math.max(minY, y)), zoom }
}

function contentBox(rect: DOMRect) {
  const worldAspect = STAGE_WORLD.w / STAGE_WORLD.h
  const elAspect = rect.width / rect.height
  if (elAspect > worldAspect) {
    const renderH = rect.height
    const renderW = renderH * worldAspect
    return { renderW, renderH, offsetX: (rect.width - renderW) / 2, offsetY: 0 }
  }
  const renderW = rect.width
  const renderH = renderW / worldAspect
  return { renderW, renderH, offsetX: 0, offsetY: (rect.height - renderH) / 2 }
}

export function PanZoomStage({ children, hint }: { children: (viewBox: string) => ReactNode; hint?: string }) {
  const { t } = useI18n()
  const hintText = hint ?? t('stage.panHint')
  const [view, setView] = useState<View>({ x: 0, y: 0, zoom: 1 })
  const viewRef = useRef(view)
  viewRef.current = view
  const wrapRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; viewX: number; viewY: number; moved: boolean } | null>(null)
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map())
  const pinch = useRef<{ dist: number; view: View } | null>(null)
  const skipClick = useRef(false)

  const applyZoom = useCallback((nextZoom: number, clientX: number, clientY: number) => {
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const box = contentBox(rect)
    const prev = viewRef.current
    const zoom = clampZoom(nextZoom)
    const old = viewSize(prev.zoom)
    const next = viewSize(zoom)
    const nx = (clientX - rect.left - box.offsetX) / box.renderW
    const ny = (clientY - rect.top - box.offsetY) / box.renderH
    const worldX = prev.x + nx * old.w
    const worldY = prev.y + ny * old.h
    const nextView = clampPan(worldX - nx * next.w, worldY - ny * next.h, zoom)
    viewRef.current = nextView
    setView(nextView)
  }, [])

  const zoomBy = (dir: 1 | -1) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    applyZoom(viewRef.current.zoom * (dir > 0 ? STEP : 1 / STEP), rect.left + rect.width / 2, rect.top + rect.height / 2)
  }

  const reset = () => {
    const nextView = { x: 0, y: 0, zoom: 1 }
    viewRef.current = nextView
    setView(nextView)
  }

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      applyZoom(viewRef.current.zoom * (event.deltaY < 0 ? STEP : 1 / STEP), event.clientX, event.clientY)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [applyZoom])

  const { w, h } = viewSize(view.zoom)
  const viewBox = `${view.x} ${view.y} ${w} ${h}`

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full touch-none overflow-hidden bg-[#efe6d8]"
      onPointerDown={(event) => {
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
        if (pointers.current.size === 2) {
          const pts = [...pointers.current.values()]
          pinch.current = { dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), view: viewRef.current }
          drag.current = null
          return
        }
        wrapRef.current?.setPointerCapture(event.pointerId)
        drag.current = { x: event.clientX, y: event.clientY, viewX: view.x, viewY: view.y, moved: false }
      }}
      onPointerMove={(event) => {
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
        if (pointers.current.size === 2 && pinch.current) {
          const [a, b] = [...pointers.current.values()]
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          const rect = wrapRef.current?.getBoundingClientRect()
          if (!rect) return
          applyZoom((pinch.current.view.zoom * dist) / pinch.current.dist, rect.left + rect.width / 2, rect.top + rect.height / 2)
          return
        }
        const d = drag.current
        if (!d) return
        const dx = event.clientX - d.x
        const dy = event.clientY - d.y
        if (Math.hypot(dx, dy) > 4) d.moved = true
        if (!d.moved) return
        const rect = wrapRef.current?.getBoundingClientRect()
        if (!rect) return
        const box = contentBox(rect)
        const size = viewSize(viewRef.current.zoom)
        const nextView = clampPan(d.viewX - (dx / box.renderW) * size.w, d.viewY - (dy / box.renderH) * size.h, viewRef.current.zoom)
        viewRef.current = nextView
        setView(nextView)
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
      {children(viewBox)}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center gap-2">
        <p className="hidden rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background md:block">{hintText}</p>
        <div
          role="toolbar"
          aria-label={t('stage.viewControls')}
          className="pointer-events-auto flex items-center gap-0.5 rounded-lg border bg-card p-1 shadow-sm"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button className="flex size-8 items-center justify-center rounded-md hover:bg-muted" onClick={() => zoomBy(-1)} aria-label={t('stage.zoomOut')}>
            <ZoomOut className="size-4" />
          </button>
          <button className="flex size-8 items-center justify-center rounded-md hover:bg-muted" onClick={() => zoomBy(1)} aria-label={t('stage.zoomIn')}>
            <ZoomIn className="size-4" />
          </button>
          <button className="flex size-8 items-center justify-center rounded-md hover:bg-muted" onClick={reset} aria-label={t('stage.reset')}>
            <Locate className="size-4" />
          </button>
          <span className="px-2 font-mono text-[10px] text-muted-foreground">{Math.round(view.zoom * 100)}%</span>
        </div>
      </div>
    </div>
  )
}
