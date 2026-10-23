'use client'

import { ArrowRight, CircuitBoard, Cpu } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '@/lib/i18n/provider'
import type { Lesson } from '@/lib/lessons'
import { cn } from '@/lib/utils'
import type { StageViewMode } from './stage-toolbar'

const TAB_IDS = ['overview', 'wiring', 'steps', 'specs'] as const
type TabId = (typeof TAB_IDS)[number]

type Props = {
  lesson: Lesson
  index: number
  total: number
  stageMode: StageViewMode
  onOpenDiagram: (mode: Extract<StageViewMode, 'schematic' | 'pinout'>) => void
}

export function LessonPanel({ lesson, index, total, stageMode, onOpenDiagram }: Props) {
  const { t } = useI18n()
  const [tab, setTab] = useState<TabId>('overview')
  const tabs = TAB_IDS.map((id) => ({ id, label: t(`panel.${id}`) }))

  return (
    <section aria-label={t('panel.info')} className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--soft-shadow)]">
      <header className="border-b border-border px-4 pb-3 pt-3.5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
            {t('lab.lessonOf', {
              current: String(index + 1).padStart(2, '0'),
              total: String(total).padStart(2, '0'),
            })}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground">{t('lab.systemReady')}</p>
        </div>
        <h2 className="mt-1 text-pretty text-lg font-extrabold tracking-tight text-foreground">{lesson.title}</h2>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{lesson.summary}</p>
      </header>

      <div role="tablist" aria-label={t('panel.tabs')} className="flex gap-0.5 overflow-x-auto border-b border-border px-2 pt-2 scrollbar-none">
        {tabs.map((item) => (
          <button
            key={item.id}
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            onClick={() => setTab(item.id)}
            className={cn(
              'relative shrink-0 rounded-t-lg px-3 pb-2.5 pt-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
              tab === item.id &&
                'font-bold text-foreground after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {tab === 'overview' && (
          <div className="flex flex-col gap-4">
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{lesson.description}</p>
            <ul className="flex flex-col gap-2">
              {lesson.points.map((p) => (
                <li key={p.text} className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-border bg-background">
                    <p.icon className="size-4 text-foreground" aria-hidden="true" />
                  </span>
                  <span className="text-sm leading-relaxed text-foreground">
                    {p.text}
                    {p.code && (
                      <code className="ml-1.5 rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">{p.code}</code>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'wiring' && (
          <ul className="flex flex-col divide-y divide-border">
            {lesson.wiring.map((w) => (
              <li key={w.from + w.to} className="flex flex-col gap-0.5 py-2.5">
                <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  <span className="rounded-lg border border-border bg-background px-1.5 py-0.5 font-mono text-xs">{w.from}</span>
                  <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  <span className="rounded-lg border border-border bg-background px-1.5 py-0.5 font-mono text-xs">{w.to}</span>
                </div>
                {w.note && <p className="text-xs leading-relaxed text-muted-foreground">{w.note}</p>}
              </li>
            ))}
          </ul>
        )}

        {tab === 'steps' && (
          <ol className="flex flex-col gap-3">
            {lesson.steps.map((s, i) => (
              <li key={s} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-background">
                  {i + 1}
                </span>
                <p className="text-pretty text-sm leading-relaxed text-foreground">{s}</p>
              </li>
            ))}
          </ol>
        )}

        {tab === 'specs' && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-sm">
            {lesson.specs.map((s) => (
              <div key={s.label} className="contents">
                <dt className="text-muted-foreground">{s.label}</dt>
                <dd className="font-medium text-foreground">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="border-t border-border bg-muted/35 p-3">
        <p className="mb-2 px-0.5 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">{t('panel.diagrams')}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <DiagramAction
            active={stageMode === 'schematic'}
            icon={CircuitBoard}
            title={t('panel.openSchematic')}
            body={t('panel.openSchematicHint')}
            onClick={() => onOpenDiagram('schematic')}
          />
          <DiagramAction
            active={stageMode === 'pinout'}
            icon={Cpu}
            title={t('panel.openPinout')}
            body={t('panel.openPinoutHint')}
            onClick={() => onOpenDiagram('pinout')}
          />
        </div>
      </div>
    </section>
  )
}

function DiagramAction({
  active,
  icon: Icon,
  title,
  body,
  onClick,
}: {
  active: boolean
  icon: typeof CircuitBoard
  title: string
  body: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex w-full items-start gap-2.5 rounded-xl border px-2.5 py-2.5 text-left transition',
        active
          ? 'border-primary/50 bg-secondary shadow-[var(--soft-shadow)]'
          : 'border-border bg-card hover:border-primary/35 hover:bg-secondary/60',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border',
          active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-primary',
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-bold text-foreground">{title}</span>
        <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{body}</span>
      </span>
    </button>
  )
}
