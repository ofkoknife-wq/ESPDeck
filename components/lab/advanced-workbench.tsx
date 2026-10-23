'use client'

import { ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ADVANCED_PACKAGES, ADVANCED_STAGES } from '@/lib/advanced-lessons'
import type { LessonRecord } from '@/lib/advanced-types'
import { TRACKS, lessonMastery, trackProgress } from '@/lib/curriculum'
import { getLocalizedAdvancedLesson } from '@/lib/i18n/localize-advanced'
import { useI18n } from '@/lib/i18n/provider'
import { LESSONS } from '@/lib/lessons'
import { AdvancedLessonLab } from './advanced-lesson-lab'

const TRACK_KEYS: Record<string, { title: string; goal: string }> = {
  foundations: { title: 'tracks.foundationsTitle', goal: 'tracks.foundationsGoal' },
  build: { title: 'tracks.buildTitle', goal: 'tracks.buildGoal' },
  engineering: { title: 'tracks.engineeringTitle', goal: 'tracks.engineeringGoal' },
  product: { title: 'tracks.productTitle', goal: 'tracks.productGoal' },
}

const STAGE_KEYS: Record<string, { title: string; goal: string; project: string }> = {
  core: { title: 'stages.coreTitle', goal: 'stages.coreGoal', project: 'stages.coreProject' },
  protocols: { title: 'stages.protocolsTitle', goal: 'stages.protocolsGoal', project: 'stages.protocolsProject' },
  realtime: { title: 'stages.realtimeTitle', goal: 'stages.realtimeGoal', project: 'stages.realtimeProject' },
  sensors: { title: 'stages.sensorsTitle', goal: 'stages.sensorsGoal', project: 'stages.sensorsProject' },
  product: { title: 'stages.productTitle', goal: 'stages.productGoal', project: 'stages.productProject' },
  projects: { title: 'stages.projectsTitle', goal: 'stages.projectsGoal', project: 'stages.projectsProject' },
}

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
  const { t, locale } = useI18n()
  const [lessonId, setLessonId] = useState<string | null>(null)
  const lesson = lessonId ? getLocalizedAdvancedLesson(lessonId, locale) : undefined

  const tracks = useMemo(
    () =>
      TRACKS.map((track) => ({
        ...track,
        progress: trackProgress(track.id, records, basicDone, LESSONS.length),
        stages: ADVANCED_STAGES.filter((stage) => track.stageIds.includes(stage.id)),
      })),
    [records, basicDone],
  )

  const masteryLabel = (mastery: string) => {
    if (mastery === 'mastered') return t('advanced.mastered')
    if (mastery === 'passed') return t('advanced.passed')
    return t('advanced.inProgress')
  }

  const packTitle = (id: string, fallback: string) => {
    if (locale === 'zh-CN') return fallback
    return getLocalizedAdvancedLesson(id, locale)?.title ?? fallback
  }

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
            <p className="eyebrow">{t('advanced.heroEyebrow')}</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">{t('advanced.heroTitle')}</h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">{t('advanced.heroBody')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setLessonId('i2c-scan')} className="rounded-full bg-foreground px-4 py-2 text-sm font-bold text-background">
              {t('advanced.demo')}
            </button>
            <button onClick={onBack} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-bold hover:bg-secondary">
              {t('advanced.backBasics')}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {tracks.map((track) => {
            const keys = TRACK_KEYS[track.id]
            return (
              <section key={track.id} className="rounded-[1.5rem] border bg-card p-5 shadow-sm">
                <p className="font-mono text-xs text-muted-foreground">{t('advanced.stage', { index: track.index })}</p>
                <h3 className="mt-1 text-xl font-black">{keys ? t(keys.title) : track.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{keys ? t(keys.goal) : track.goal}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${track.progress.total ? (track.progress.done / track.progress.total) * 100 : 0}%` }}
                  />
                </div>
                <p className="mt-1 font-mono text-xs">
                  {t('advanced.lessonCount', {
                    done: track.progress.done,
                    total: track.progress.total,
                    kind: track.usesBasicLab ? t('advanced.basicKind') : t('advanced.advancedKind'),
                  })}
                </p>
                {track.usesBasicLab && (
                  <button onClick={onBack} className="mt-4 text-sm font-bold">
                    {t('advanced.openLab')} <ChevronRight className="inline size-3" />
                  </button>
                )}
              </section>
            )
          })}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {ADVANCED_STAGES.map((stage) => {
            const Icon = stage.icon
            const trackKeys = TRACK_KEYS[stage.trackId]
            const stageKeys = STAGE_KEYS[stage.id]
            return (
              <section key={stage.id} className="rounded-[1.5rem] border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl text-white" style={{ background: stage.color }}>
                    <Icon className="size-5" />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {trackKeys ? t(trackKeys.title) : TRACKS.find((track) => track.id === stage.trackId)?.title} · {stage.index}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-black">{stageKeys ? t(stageKeys.title) : stage.title}</h3>
                <p className="text-xs text-muted-foreground">{stageKeys ? t(stageKeys.goal) : stage.goal}</p>
                <p className="mt-2 rounded-xl bg-secondary px-3 py-2 text-sm">
                  {t('advanced.project', { name: stageKeys ? t(stageKeys.project) : stage.project })}
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
                            <span className="font-bold">{packTitle(id, pack.title)}</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {pack.type} · {pack.complete ? t('advanced.fullStation') : t('advanced.building')} · {masteryLabel(mastery)}
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
