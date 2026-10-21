'use client'

import type { HardwareKit } from '@/lib/advanced-types'

export function HardwareKitPanel({
  kit,
  acked,
  onAck,
}: {
  kit: HardwareKit
  acked: boolean
  onAck: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="eyebrow">采购清单</p>
        <ul className="mt-2 divide-y">
          {kit.bom.map((row) => (
            <li key={row.item} className="flex items-start justify-between gap-3 py-2 text-sm">
              <span>
                <span className="font-bold">{row.item}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{row.note}</span>
              </span>
              <span className="font-mono text-xs">×{row.qty}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl bg-destructive/10 p-3">
        <p className="text-sm font-black text-destructive">安全提示</p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
          {kit.safety.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-sm font-bold">仿真 → 真机差异</p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
          {kit.analogToReal.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <button
        onClick={onAck}
        className="self-start rounded-xl bg-foreground px-4 py-2 text-sm font-bold text-background"
      >
        {acked ? '已确认，可动手接线' : '我已阅读清单和安全提示'}
      </button>
    </div>
  )
}
