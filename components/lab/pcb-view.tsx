'use client'

import type { CircuitGraph, Fault } from '@/lib/advanced-types'

export function PcbView({
  graph,
  fault,
  onSelectNet,
  onSelectPart,
}: {
  graph: CircuitGraph
  fault?: Fault
  onSelectNet: (id: string) => void
  onSelectPart: (id: string) => void
}) {
  const part = (id: string) => graph.parts.find((item) => item.id === id)

  return (
    <svg viewBox="0 0 640 360" className="h-full w-full" role="img" aria-label="PCB 俯视图">
      <rect width="640" height="360" fill="#173528" rx="18" />
      <rect x="18" y="18" width="604" height="324" fill="none" stroke="#2f6b4a" strokeWidth="2" rx="12" />
      {graph.nets.map((net, index) => {
        const a = part(net.from)
        const b = part(net.to)
        if (!a || !b) return null
        const broken = fault?.netId === net.id
        const yOff = (index - graph.nets.length / 2) * 10
        return (
          <path
            key={net.id}
            d={`M${a.x + 40} ${a.y + 20} L${a.x + 40} ${200 + yOff} L${b.x + 40} ${200 + yOff} L${b.x + 40} ${b.y + 20}`}
            fill="none"
            stroke={broken ? '#f25042' : '#d4b45a'}
            strokeWidth={broken ? 5 : 4}
            strokeDasharray={broken ? '7 5' : undefined}
            className="cursor-pointer"
            onClick={() => onSelectNet(net.id)}
          />
        )
      })}
      {graph.parts.map((item) => (
        <g key={item.id} className="cursor-pointer" onClick={() => onSelectPart(item.id)}>
          <rect x={item.x} y={item.y} width={100} height={44} rx={4} fill="#0f1c14" stroke="#c9a227" strokeWidth="1.5" />
          <circle cx={item.x + 12} cy={item.y + 22} r="4" fill="#d4b45a" />
          <circle cx={item.x + 88} cy={item.y + 22} r="4" fill="#d4b45a" />
          <text x={item.x + 22} y={item.y + 20} fontSize="11" fill="#eaddcf">
            {item.label}
          </text>
          {item.value && (
            <text x={item.x + 22} y={item.y + 34} fontSize="10" fill="#8fbc8f">
              {item.value}
            </text>
          )}
          {fault?.partId === item.id && (
            <text x={item.x} y={item.y - 6} fontSize="10" fill="#f25042">
              检查此封装
            </text>
          )}
        </g>
      ))}
      <text x="32" y="44" fontSize="12" fill="#8fbc8f">
        TOP · 3.3V 覆铜 · 点击走线检查开路
      </text>
    </svg>
  )
}
