'use client'

import { ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ADVANCED_PACKAGES, ADVANCED_STAGES, getAdvancedLesson } from '@/lib/advanced-lessons'
import type { LessonRecord } from '@/lib/advanced-types'
import { TRACKS, lessonMastery, trackProgress } from '@/lib/curriculum'
import { LESSONS } from '@/lib/lessons'
import { AdvancedLessonLab } from './advanced-lesson-lab'

export function AdvancedWorkbench({
  onBack,
  basicDone,
  records,
  onPatch,
}: {
  onBack: () => void
  basicDone: number
  records: Record<string, LessonRecord>
  onPatch: (id: string, patch: Partial<LessonRecord>) => void
}) {
  const [lessonId, setLessonId] = useState<string | null>(null)
  const lesson = lessonId ? getAdvancedLesson(lessonId) : undefined

  const tracks = useMemo(
    () =>
      TRACKS.map((track) => ({
        ...track,
        progress: trackProgress(track.id, records, basicDone, LESSONS.length),
        stages: ADVANCED_STAGES.filter((stage) => track.stageIds.includes(stage.id)),
      })),
    [records, basicDone],
  )

  if (lesson) {
    return (
      <div className="advanced-shell flex min-h-0 flex-1 flex-col">
        <AdvancedLessonLab
          lesson={lesson}
          record={records[lesson.id] ?? { ran: false, faultsSolved: [], challengeScore: 0, quizScore: 0, kitAck: false, rubricChecked: [] }}
          onPatch={(patch) => onPatch(lesson.id, patch)}
          onBack={() => setLessonId(null)}
        />
      </div>
    )
  }

  return (
    <div className="advanced-shell flex min-h-0 flex-1 flex-col overflow-auto px-4 pb-6 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="advanced-hero flex flex-wrap items-end justify-between gap-5 rounded-[1.75rem] px-6 py-7 sm:px-9">
          <div>
            <p className="eyebrow">能力路线 / ESP32 零基础 → 产品级硬件</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">进阶工作台</h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              每节课都是工位：原理图、面包板、PCB，加上故障、仪器、代码补全、测验和真机清单。掌握度不再只记录「看过」。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setLessonId('i2c-scan')} className="rounded-full bg-foreground px-4 py-2 text-sm font-bold text-background">
              示范课：I2C 总线扫描
            </button>
            <button onClick={onBack} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-bold hover:bg-secondary">
              返回零基础实验台
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {tracks.map((track) => (
            <section key={track.id} className="rounded-[1.5rem] border bg-card p-5 shadow-sm">
              <p className="font-mono text-xs text-muted-foreground">阶段 {track.index}</p>
              <h3 className="mt-1 text-xl font-black">{track.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{track.goal}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${track.progress.total ? (track.progress.done / track.progress.total) * 100 : 0}%` }}
                />
              </div>
              <p className="mt-1 font-mono text-xs">
                {track.progress.done}/{track.progress.total}
                {track.usesBasicLab ? ' 基础课' : ' 进阶课'}
              </p>
              {track.usesBasicLab && (
                <button onClick={onBack} className="mt-4 text-sm font-bold">
                  打开 3D 实验台 <ChevronRight className="inline size-3" />
                </button>
              )}
            </section>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {ADVANCED_STAGES.map((stage) => {
            const Icon = stage.icon
            return (
              <section key={stage.id} className="rounded-[1.5rem] border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl text-white" style={{ background: stage.color }}>
                    <Icon className="size-5" />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {TRACKS.find((track) => track.id === stage.trackId)?.title} · {stage.index}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-black">{stage.title}</h3>
                <p className="text-xs text-muted-foreground">{stage.goal}</p>
                <p className="mt-2 rounded-xl bg-secondary px-3 py-2 text-sm">
                  阶段项目：<span className="font-bold">{stage.project}</span>
                </p>
                <ul className="mt-3 space-y-2">
                  {stage.lessonIds.map((id) => {
                    const pack = ADVANCED_PACKAGES.find((item) => item.id === id)!
                    const mastery = lessonMastery(id, records[id], true)
                    return (
                      <li key={id}>
                        <button
                          onClick={() => setLessonId(id)}
                          className="flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm hover:bg-secondary"
                        >
                          <span>
                            <span className="font-bold">{pack.title}</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {pack.type} · {pack.complete ? '完整工位' : '建设中'} · {masteryLabel(mastery)}
                            </span>
                          </span>
                          <ChevronRight className="size-4" />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function masteryLabel(mastery: string) {
  if (mastery === 'mastered') return '已掌握'
  if (mastery === 'passed') return '已通过'
  return '进行中'
}
