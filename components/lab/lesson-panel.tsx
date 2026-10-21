'use client'

import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import type { Lesson } from '@/lib/lessons'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'overview', label: '概述' },
  { id: 'wiring', label: '接线' },
  { id: 'steps', label: '步骤' },
  { id: 'specs', label: '规格' },
] as const

type TabId = (typeof TABS)[number]['id']

export function LessonPanel({ lesson, index }: { lesson: Lesson; index: number }) {
  const [tab, setTab] = useState<TabId>('overview')

  return (
    <section aria-label="课程信息" className="flex min-h-0 flex-col rounded-xl border bg-card shadow-sm">
      <div role="tablist" aria-label="课程内容" className="flex gap-1 border-b px-2 pt-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={cn(
              'relative px-3 pb-2.5 pt-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
              tab === t.id &&
                'font-bold text-foreground after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="min-h-0 flex-1 overflow-y-auto p-4"
      >
        <p className="font-mono text-xs font-bold tracking-widest text-primary">第 {index + 1} 课</p>
        <h2 className="mt-1 text-pretty text-xl font-black text-foreground">{lesson.title}</h2>

        {tab === 'overview' && (
          <div className="mt-2 flex flex-col gap-4">
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{lesson.description}</p>
            <ul className="flex flex-col gap-2">
              {lesson.points.map((p) => (
                <li key={p.text} className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background">
                    <p.icon className="size-4 text-foreground" aria-hidden="true" />
                  </span>
                  <span className="text-sm leading-relaxed text-foreground">
                    {p.text}
                    {p.code && (
                      <code className="ml-1.5 rounded bg-accent/10 px-1.5 py-0.5 font-mono text-xs text-accent">
                        {p.code}
                      </code>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'wiring' && (
          <ul className="mt-3 flex flex-col divide-y">
            {lesson.wiring.map((w) => (
              <li key={w.from + w.to} className="flex flex-col gap-0.5 py-2.5">
                <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  <span className="rounded border bg-background px-1.5 py-0.5 font-mono text-xs">{w.from}</span>
                  <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  <span className="rounded border bg-background px-1.5 py-0.5 font-mono text-xs">{w.to}</span>
                </div>
                {w.note && <p className="text-xs leading-relaxed text-muted-foreground">{w.note}</p>}
              </li>
            ))}
          </ul>
        )}

        {tab === 'steps' && (
          <ol className="mt-3 flex flex-col gap-3">
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
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {lesson.specs.map((s) => (
              <div key={s.label} className="contents">
                <dt className="text-muted-foreground">{s.label}</dt>
                <dd className="font-medium text-foreground">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  )
}
