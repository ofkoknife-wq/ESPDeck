'use client'

import { ArrowRight, CircuitBoard, Cpu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n/provider'
import type { Lesson } from '@/lib/lessons'
import { cn } from '@/lib/utils'
import type { StageViewMode } from './stage-toolbar'

const CONTENT_TABS = ['overview', 'wiring', 'steps', 'specs'] as const
const DIAGRAM_TABS = ['schematic', 'pinout'] as const
const TAB_IDS = [...CONTENT_TABS, ...DIAGRAM_TABS] as const
type TabId = (typeof TAB_IDS)[number]

type Props = {
  lesson: Lesson
  index: number
  total: number
  stageMode: StageViewMode
  onOpenDiagram: (mode: Extract<StageViewMode, 'schematic' | 'pinout'>) => void
  onBackToScene?: () => void
}

function isDiagramTab(tab: TabId): tab is 'schematic' | 'pinout' {
  return tab === 'schematic' || tab === 'pinout'
}

export function LessonPanel({ lesson, index, total, stageMode, onOpenDiagram, onBackToScene }: Props) {
  const { t } = useI18n()
  const [tab, setTab] = useState<TabId>('overview')

  useEffect(() => {
    setTab('overview')
  }, [lesson.id])

  useEffect(() => {
    if (stageMode === 'schematic' || stageMode === 'pinout') setTab(stageMode)
    else if (isDiagramTab(tab)) setTab('overview')
    // Only sync when stage mode changes from toolbar / other entry points.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageMode])

  const selectTab = (next: TabId) => {
    setTab(next)
    if (isDiagramTab(next)) onOpenDiagram(next)
    else onBackToScene?.()
  }

  return (
    <section aria-label={t('panel.info')} className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--soft-shadow)]">
      <header className="shrink-0 border-b border-border px-4 pb-2.5 pt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-primary uppercase">
            {t('lab.lessonOf', {
              current: String(index + 1).padStart(2, '0'),
              total: String(total).padStart(2, '0'),
            })}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground">{t('lab.systemReady')}</p>
        </div>
        <h2 className="mt-0.5 truncate text-base font-extrabold tracking-tight text-foreground">{lesson.title}</h2>
      </header>

      <div role="tablist" aria-label={t('panel.tabs')} className="flex shrink-0 gap-0.5 overflow-x-auto border-b border-border px-1.5 pt-1.5 scrollbar-none">
        {CONTENT_TABS.map((id) => (
          <TabButton key={id} id={id} label={t(`panel.${id}`)} selected={tab === id} onSelect={selectTab} />
        ))}
        <span className="mx-0.5 my-2 w-px shrink-0 bg-border" aria-hidden />
        {DIAGRAM_TABS.map((id) => (
          <TabButton
            key={id}
            id={id}
            label={t(id === 'schematic' ? 'panel.openSchematic' : 'panel.openPinout')}
            selected={tab === id}
            onSelect={selectTab}
          />
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

        {tab === 'schematic' && (
          <DiagramGuide
            icon={CircuitBoard}
            title={t('panel.openSchematic')}
            body={t('panel.schematicGuide')}
            hint={t('panel.diagramStageHint')}
          />
        )}

        {tab === 'pinout' && (
          <DiagramGuide
            icon={Cpu}
            title={t('panel.openPinout')}
            body={t('panel.pinoutGuide')}
            hint={t('panel.diagramStageHint')}
          />
        )}
      </div>
    </section>
  )
}

function TabButton({
  id,
  label,
  selected,
  onSelect,
}: {
  id: TabId
  label: string
  selected: boolean
  onSelect: (id: TabId) => void
}) {
  return (
    <button
      type="button"
      role="tab"
      id={`tab-${id}`}
      aria-selected={selected}
      aria-controls={`panel-${id}`}
      onClick={() => onSelect(id)}
      className={cn(
        'relative shrink-0 rounded-t-lg px-2.5 pb-2 pt-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground',
        selected && 'font-bold text-foreground after:absolute after:inset-x-1.5 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary',
      )}
    >
      {label}
    </button>
  )
}

function DiagramGuide({
  icon: Icon,
  title,
  body,
  hint,
}: {
  icon: typeof CircuitBoard
  title: string
  body: string
  hint: string
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/50 p-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-foreground">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
    </div>
  )
}
