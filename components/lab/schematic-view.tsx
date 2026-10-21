'use client'

import type { CircuitGraph, Fault } from '@/lib/advanced-types'
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

export function SchematicView({
  graph,
  fault,
  solved,
  onSelectNet,
  onSelectPart,
}: {
  graph: CircuitGraph
  fault?: Fault
  solved: string[]
  onSelectNet: (id: string) => void
  onSelectPart: (id: string) => void
}) {
  const part = (id: string) => graph.parts.find((item) => item.id === id)

  return (
    <svg viewBox="0 0 640 360" className="h-full w-full" role="img" aria-label="原理图">
      <rect width="640" height="360" fill="#f4eee6" />
      {graph.nets.map((net) => {
        const a = part(net.from)
        const b = part(net.to)
        if (!a || !b) return null
        const broken = fault?.netId === net.id
        const repaired = solved.some((id) => {
          const f = id
          return f && broken === false
        })
        return (
          <g key={net.id}>
            <line
              x1={a.x + 70}
              y1={a.y + 24}
              x2={b.x}
              y2={b.y + 24}
              stroke={broken ? '#f25042' : net.color}
              strokeWidth={broken ? 4 : 3}
              strokeDasharray={broken ? '8 6' : undefined}
              className="cursor-pointer"
              onClick={() => onSelectNet(net.id)}
            />
            <text x={(a.x + b.x) / 2 + 30} y={(a.y + b.y) / 2 + 14} fontSize="11" fill="#716040">
              {net.label}
              {broken ? ' · 异常' : repaired ? '' : ''}
            </text>
          </g>
        )
      })}
      {graph.parts.map((item) => {
        const suspect = fault?.partId === item.id
        return (
          <g key={item.id} className="cursor-pointer" onClick={() => onSelectPart(item.id)}>
            <rect
              x={item.x}
              y={item.y}
              width={item.kind === 'mcu' ? 88 : 118}
              height={48}
              rx={8}
              fill={KIND_FILL[item.kind] ?? '#333'}
              className={cn(suspect && 'opacity-90')}
              stroke={suspect ? '#f25042' : 'transparent'}
              strokeWidth={3}
            />
            <text x={item.x + 10} y={item.y + 20} fontSize="12" fill="#fff" fontWeight="700">
              {item.label}
            </text>
            {item.value && (
              <text x={item.x + 10} y={item.y + 36} fontSize="10" fill="#eaddcf">
                {item.value}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
