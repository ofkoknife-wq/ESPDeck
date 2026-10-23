'use client'

import type { CircuitGraph, Fault } from '@/lib/advanced-types'
import { useI18n } from '@/lib/i18n/provider'
import { cn } from '@/lib/utils'

const KIND_FILL: Record<string, string> = {
  mcu: '#020826',
  oled: '#1d3b2a',
  button: '#9b5a35',
  led: '#f25042',
  resistor: '#8c7851',
  pot: '#3870b8',
  dht: '#3e8b68',
  pullup: '#c47b3b',
  device: '#7352a4',
  usb: '#2a2a2a',
}

const BOX = { mcu: [108, 64] as const, default: [128, 56] as const }

export function SchematicView({
  graph,
  fault,
  viewBox = '0 0 720 420',
  onSelectNet,
  onSelectPart,
}: {
  graph: CircuitGraph
  fault?: Fault
  solved: string[]
  viewBox?: string
  onSelectNet: (id: string) => void
  onSelectPart: (id: string) => void
}) {
  const { t } = useI18n()
  const part = (id: string) => graph.parts.find((item) => item.id === id)
  const sizeOf = (kind: string) => (kind === 'mcu' ? BOX.mcu : BOX.default)

  return (
    <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" className="h-full w-full" role="img" aria-label={t('views.schematicAria')}>
      <defs>
        <pattern id="sch-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#d8cbb8" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="720" height="420" fill="#f4eee6" />
      <rect width="720" height="420" fill="url(#sch-grid)" />
      {graph.nets.map((net, index) => {
        const a = part(net.from)
        const b = part(net.to)
        if (!a || !b) return null
        const [aw, ah] = sizeOf(a.kind)
        const [, bh] = sizeOf(b.kind)
        const x1 = a.x + aw
        const y1 = a.y + ah / 2
        const x2 = b.x
        const y2 = b.y + bh / 2
        const midX = (x1 + x2) / 2 + (index % 3) * 8
        const d = `M${x1} ${y1} L${midX} ${y1} L${midX} ${y2} L${x2} ${y2}`
        const broken = fault?.netId === net.id
        return (
          <g key={net.id} className="cursor-pointer" onClick={() => onSelectNet(net.id)}>
            <path d={d} fill="none" stroke="transparent" strokeWidth="16" />
            <path
              d={d}
              fill="none"
              stroke={broken ? '#f25042' : net.color}
              strokeWidth={broken ? 4.5 : 3}
              strokeDasharray={broken ? '9 6' : undefined}
              strokeLinejoin="round"
            />
            <text x={midX + 6} y={(y1 + y2) / 2 - 6} fontSize="11" fill="#716040">
              {net.label}
              {broken ? t('views.openCircuit') : ''}
            </text>
          </g>
        )
      })}
      {graph.parts.map((item) => {
        const [w, h] = sizeOf(item.kind)
        const suspect = fault?.partId === item.id
        return (
          <g key={item.id} className="cursor-pointer" onClick={() => onSelectPart(item.id)}>
            <rect
              x={item.x}
              y={item.y}
              width={w}
              height={h}
              rx={10}
              fill={KIND_FILL[item.kind] ?? '#333'}
              stroke={suspect ? '#f25042' : '#fff'}
              strokeWidth={suspect ? 3 : 1}
              className={cn(suspect && 'opacity-95')}
            />
            <circle cx={item.x + w} cy={item.y + h / 2} r="4" fill="#eaddcf" />
            <text x={item.x + 12} y={item.y + 24} fontSize="13" fill="#fff" fontWeight="700">
              {item.label}
            </text>
            {item.value && (
              <text x={item.x + 12} y={item.y + 42} fontSize="11" fill="#eaddcf">
                {item.value}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
