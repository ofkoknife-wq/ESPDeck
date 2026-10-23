'use client'

import { Gauge, Radio, Server, Waves } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useI18n } from '@/lib/i18n/provider'
import type { AdvancedOutputs } from '@/lib/use-advanced-simulation'
import type { LogLine, Phase } from '@/lib/use-simulation'
import { cn } from '@/lib/utils'

const TAB_IDS = [
  { id: 'scope' as const, icon: Waves, key: 'instruments.scope' },
  { id: 'serial' as const, icon: Radio, key: 'instruments.serial' },
  { id: 'power' as const, icon: Gauge, key: 'instruments.power' },
  { id: 'network' as const, icon: Server, key: 'instruments.network' },
]

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
  const { t } = useI18n()
  const tabs = TAB_IDS.filter((tab) => enabled.includes(tab.id))
  const [tab, setTab] = useState<(typeof TAB_IDS)[number]['id']>(tabs[0]?.id ?? 'serial')
  const points = useMemo(
    () => outputs.scope.map((v, i) => `${i * (1100 / Math.max(outputs.scope.length - 1, 1))},${90 - (v / 3.3) * 70}`).join(' '),
    [outputs.scope],
  )

  return (
    <section className="overflow-hidden rounded-[1.25rem] border border-border bg-card shadow-sm">
      <div className="flex gap-1 overflow-x-auto border-b border-border p-2">
        {tabs.map(({ id, icon: Icon, key }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-bold',
              tab === id ? 'bg-foreground text-background' : 'hover:bg-secondary',
            )}
          >
            <Icon className="size-4" />
            {t(key)}
          </button>
        ))}
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          {phase === 'running' ? t('instruments.live') : t('instruments.waiting')}
        </span>
      </div>
      <div className="p-3">
        {tab === 'scope' && (
          <div className="bench-grid rounded-xl p-2 text-primary">
            <p className="mb-1 font-mono text-xs text-muted-foreground">
              CH1 · {outputs.scope.at(-1)?.toFixed(2) ?? '—'} V · {outputs.busNote}
            </p>
            <svg viewBox="0 0 1100 100" className="h-28 w-full" role="img" aria-label={t('instruments.scope')}>
              <path d="M0 50H1100M0 25H1100M0 75H1100" stroke="currentColor" opacity=".12" strokeDasharray="4 8" />
              <polyline points={points} fill="none" stroke="var(--primary)" strokeWidth="3" />
            </svg>
          </div>
        )}
        {tab === 'serial' && (
          <div className="h-32 overflow-auto rounded-xl bg-[#020826] p-3 font-mono text-xs leading-5 text-[#fffffe]">
            {logs.length === 0 && <p className="text-white/40">{t('instruments.emptySerial')}</p>}
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
              <p className="text-xs font-bold text-muted-foreground">{t('instruments.avgCurrent')}</p>
              <p className="text-3xl font-black">
                {outputs.currentMa < 1 ? `${(outputs.currentMa * 1000).toFixed(0)} μA` : `${outputs.currentMa.toFixed(1)} mA`}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-accent" style={{ width: `${Math.min(100, outputs.currentMa < 1 ? outputs.currentMa * 400 : outputs.currentMa)}%` }} />
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{t('instruments.powerHint')}</p>
          </div>
        )}
        {tab === 'network' && (
          <div className="overflow-auto rounded-xl border text-xs">
            {outputs.packets.length === 0 ? (
              <p className="p-3 text-muted-foreground">{t('instruments.emptyPackets')}</p>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-secondary">
                  <tr>
                    <th className="p-2">{t('instruments.proto')}</th>
                    <th className="p-2">{t('instruments.dir')}</th>
                    <th className="p-2">{t('instruments.data')}</th>
                    <th className="p-2">{t('instruments.status')}</th>
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
