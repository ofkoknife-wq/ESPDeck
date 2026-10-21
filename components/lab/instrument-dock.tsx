'use client'

import { Gauge, Radio, Server, Waves } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { AdvancedOutputs } from '@/lib/use-advanced-simulation'
import type { LogLine, Phase } from '@/lib/use-simulation'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'scope', label: '示波器', icon: Waves },
  { id: 'serial', label: '串口监视器', icon: Radio },
  { id: 'power', label: '功耗计', icon: Gauge },
  { id: 'network', label: '网络包', icon: Server },
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
              <p className="text-3xl font-black">
                {outputs.currentMa < 1 ? `${(outputs.currentMa * 1000).toFixed(0)} μA` : `${outputs.currentMa.toFixed(1)} mA`}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-accent" style={{ width: `${Math.min(100, outputs.currentMa < 1 ? outputs.currentMa * 400 : outputs.currentMa)}%` }} />
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              空载约 40 mA。Wi-Fi 发射会到 150 mA+。深度睡眠应落到 μA，开发板 LDO 会让真机偏高。
            </p>
          </div>
        )}
        {tab === 'network' && (
          <div className="overflow-auto rounded-xl border text-xs">
            {outputs.packets.length === 0 ? (
              <p className="p-3 text-muted-foreground">运行并补全联网代码后，这里会出现请求/发布。</p>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-secondary">
                  <tr>
                    <th className="p-2">协议</th>
                    <th className="p-2">方向</th>
                    <th className="p-2">数据</th>
                    <th className="p-2">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {outputs.packets.map((row) => (
                    <tr key={row.proto + row.data} className="border-t">
                      <td className="p-2 font-mono">{row.proto}</td>
                      <td className="p-2">{row.dir}</td>
                      <td className="p-2">{row.data}</td>
                      <td className="p-2">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
