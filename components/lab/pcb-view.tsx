'use client'

import type { CircuitGraph, Fault } from '@/lib/advanced-types'

export function PcbView({
  graph,
  fault,
  viewBox = '0 0 720 420',
  onSelectNet,
  onSelectPart,
}: {
  graph: CircuitGraph
  fault?: Fault
  viewBox?: string
  onSelectNet: (id: string) => void
  onSelectPart: (id: string) => void
}) {
  const part = (id: string) => graph.parts.find((item) => item.id === id)

  return (
    <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" className="h-full w-full" role="img" aria-label="PCB 俯视图">
      <defs>
        <pattern id="pcb-grid" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.7" fill="#1f5a3c" />
        </pattern>
      </defs>
      <rect width="720" height="420" fill="#0f2a1c" rx="20" />
      <rect x="16" y="16" width="688" height="388" fill="#173528" rx="14" />
      <rect x="16" y="16" width="688" height="388" fill="url(#pcb-grid)" rx="14" />
      {graph.nets.map((net, index) => {
        const a = part(net.from)
        const b = part(net.to)
        if (!a || !b) return null
        const broken = fault?.netId === net.id
        const yOff = 210 + (index - graph.nets.length / 2) * 14
        const d = `M${a.x + 50} ${a.y + 28} L${a.x + 50} ${yOff} L${b.x + 50} ${yOff} L${b.x + 50} ${b.y + 28}`
        return (
          <g key={net.id} className="cursor-pointer" onClick={() => onSelectNet(net.id)}>
            <path d={d} fill="none" stroke="transparent" strokeWidth="18" />
            <path d={d} fill="none" stroke={broken ? '#f25042' : '#d4b45a'} strokeWidth={broken ? 6 : 5} strokeLinejoin="round" strokeDasharray={broken ? '8 5' : undefined} />
            <circle cx={a.x + 50} cy={a.y + 28} r="5" fill={broken ? '#f25042' : '#e8d48a'} />
            <circle cx={b.x + 50} cy={b.y + 28} r="5" fill={broken ? '#f25042' : '#e8d48a'} />
          </g>
        )
      })}
      {graph.parts.map((item) => (
        <g key={item.id} className="cursor-pointer" onClick={() => onSelectPart(item.id)}>
          <rect x={item.x} y={item.y} width={110} height={52} rx="3" fill="#0c1812" stroke="#c9a227" strokeWidth="1.4" />
          <circle cx={item.x + 12} cy={item.y + 16} r="3.2" fill="#d4b45a" />
          <circle cx={item.x + 98} cy={item.y + 16} r="3.2" fill="#d4b45a" />
          <circle cx={item.x + 12} cy={item.y + 36} r="3.2" fill="#d4b45a" />
          <circle cx={item.x + 98} cy={item.y + 36} r="3.2" fill="#d4b45a" />
          <text x={item.x + 22} y={item.y + 22} fontSize="11" fill="#eaddcf">
            {item.label}
          </text>
          {item.value && (
            <text x={item.x + 22} y={item.y + 38} fontSize="10" fill="#8fbc8f">
              {item.value}
            </text>
          )}
          {fault?.partId === item.id && (
            <text x={item.x} y={item.y - 8} fontSize="11" fill="#f25042">
              检查此封装
            </text>
          )}
        </g>
      ))}
      <text x="36" y="48" fontSize="12" fill="#8fbc8f">
        TOP · 3.3V 覆铜 · 滚轮缩放 · 拖动平移 · 点击走线
      </text>
    </svg>
  )
}
