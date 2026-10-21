'use client'

import { Gauge, Radio, Waves } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { AdvancedOutputs } from '@/lib/use-advanced-simulation'
import type { LogLine, Phase } from '@/lib/use-simulation'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'scope', label: '示波器', icon: Waves },
  { id: 'serial', label: '串口监视器', icon: Radio },
  { id: 'power', label: '功耗计', icon: Gauge },
] as const

export function InstrumentDock({
  outputs,
  logs,
  phase,
  enabled,
}: {
  outputs: AdvancedOutputs
  logs: LogLine[]
  phase: Phase
  enabled: Array<'scope' | 'serial' | 'power' | 'network'>
}) {
  const tabs = TABS.filter((tab) => enabled.includes(tab.id))
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>(tabs[0]?.id ?? 'serial')
  const points = useMemo(
    () => outputs.scope.map((v, i) => `${i * (1100 / Math.max(outputs.scope.length - 1, 1))},${90 - (v / 3.3) * 70}`).join(' '),
    [outputs.scope],
  )

  return (
    <section className="overflow-hidden rounded-[1.25rem] border border-border bg-card shadow-sm">
      <div className="flex gap-1 overflow-x-auto border-b border-border p-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-bold',
              tab === id ? 'bg-foreground text-background' : 'hover:bg-secondary',
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">{phase === 'running' ? '实时采样' : '等待运行'}</span>
      </div>
      <div className="p-3">
        {tab === 'scope' && (
          <div className="bench-grid rounded-xl p-2 text-primary">
            <p className="mb-1 font-mono text-xs text-muted-foreground">
              CH1 · {outputs.scope.at(-1)?.toFixed(2) ?? '—'} V · {outputs.busNote}
            </p>
            <svg viewBox="0 0 1100 100" className="h-28 w-full" role="img" aria-label="示波器">
              <path d="M0 50H1100M0 25H1100M0 75H1100" stroke="currentColor" opacity=".12" strokeDasharray="4 8" />
              <polyline points={points} fill="none" stroke="var(--primary)" strokeWidth="3" />
            </svg>
          </div>
        )}
        {tab === 'serial' && (
          <div className="h-32 overflow-auto rounded-xl bg-[#020826] p-3 font-mono text-xs leading-5 text-[#fffffe]">
            {logs.length === 0 && <p className="text-white/40">点击运行后在这里观察日志</p>}
            {logs.slice(-12).map((line) => (
              <p key={line.id} className={line.tone === 'warn' ? 'text-[#f25042]' : line.tone === 'ok' ? 'text-[#8c7851]' : ''}>
                {line.text}
              </p>
            ))}
          </div>
        )}
        {tab === 'power' && (
          <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
            <div>
              <p className="text-xs font-bold text-muted-foreground">平均电流</p>
              <p className="text-3xl font-black">{outputs.currentMa.toFixed(0)} mA</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-accent" style={{ width: `${Math.min(100, outputs.currentMa)}%` }} />
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              空载约 40 mA。I2C 扫描、日志洪水和 5V 误接都会把电流抬高。深度睡眠课将把量程放到 μA。
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
