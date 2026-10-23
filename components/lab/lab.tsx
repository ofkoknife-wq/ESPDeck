'use client'

import dynamic from 'next/dynamic'
import { useMemo, useRef, useState } from 'react'
import { SiteFooter } from '@/components/site/site-footer'
import { ThanksHost } from '@/components/site/thanks-modal'
import { useI18n } from '@/lib/i18n/provider'
import { getLessons } from '@/lib/i18n/localize-lesson'
import { useProgress } from '@/lib/use-progress'
import { useSimulation } from '@/lib/use-simulation'
import { AdvancedWorkbench } from './advanced-workbench'
import { CalloutLayer } from './callout-layer'
import { CodePanel } from './code-panel'
import { Header } from './header'
import { LessonPanel } from './lesson-panel'
import { LessonRail } from './lesson-rail'
import { SimControls } from './sim-controls'
import { StageToolbar } from './stage-toolbar'
import { LESSON_SCENES } from './three/circuits'
import type { ViewApi } from './three/scene'

function SceneLoading() {
  const { t } = useI18n()
  return <div className="flex h-full items-center justify-center font-mono text-sm text-muted-foreground">{t('lab.loadingScene')}</div>
}

const Scene = dynamic(() => import('./three/scene'), {
  ssr: false,
  loading: () => <SceneLoading />,
})

export function Lab() {
  const { t, locale } = useI18n()
  const lessons = useMemo(() => getLessons(locale), [locale])
  const [index, setIndex] = useState(0)
  const [showLabels, setShowLabels] = useState(true)
  const [advanced, setAdvanced] = useState(false)
  const safeIndex = Math.min(index, lessons.length - 1)
  const lesson = lessons[safeIndex]
  const { completed, markComplete, advanced: advancedRecords, patchAdvanced } = useProgress()
  const sim = useSimulation(lesson.id, markComplete)
  const viewRef = useRef<ViewApi | null>(null)
  const calloutsRef = useRef<(HTMLDivElement | null)[]>([])

  return (
    <div className="lab-shell flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <Header
        done={completed.length}
        total={lessons.length}
        advanced={advanced}
        advancedRecords={advancedRecords}
        onToggleAdvanced={() => setAdvanced((value) => !value)}
      />

      {advanced ? (
        <AdvancedWorkbench
          onBack={() => setAdvanced(false)}
          basicDone={completed.length}
          records={advancedRecords}
          onPatch={patchAdvanced}
        />
      ) : (
        <div className="lab-body flex min-h-0 flex-1 flex-col lg:flex-row">
          <LessonRail
            lessons={lessons}
            activeIndex={safeIndex}
            completed={completed}
            onSelect={setIndex}
            onOpenAdvanced={() => setAdvanced(true)}
          />

          <main className="lab-main grid min-h-0 flex-1 grid-cols-1 gap-3 px-4 pb-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:grid-rows-[42px_minmax(0,1fr)] lg:gap-4 lg:px-8 lg:pb-5">
            <div className="workbench-heading col-span-1 flex items-end justify-between gap-4 lg:col-span-2">
              <div>
                <p className="eyebrow">{t('lab.workbenchEyebrow')}</p>
                <h2 className="text-xl font-black tracking-tight md:text-2xl">{lesson.title}</h2>
              </div>
              <div className="hidden text-right font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:block">
                <div>
                  {t('lab.lessonOf', {
                    current: String(safeIndex + 1).padStart(2, '0'),
                    total: String(lessons.length).padStart(2, '0'),
                  })}
                </div>
                <div className="mt-1 text-accent">{t('lab.systemReady')}</div>
              </div>
            </div>
            <section
              aria-label={`${t('lab.lessonN', { n: safeIndex + 1 })} · ${lesson.title}`}
              className="relative min-h-96 flex-1 lg:min-h-0"
            >
              <Scene
                lessonId={lesson.id}
                outputs={sim.outputs}
                inputs={sim.inputs}
                setInput={sim.setInput}
                viewRef={viewRef}
                calloutsRef={calloutsRef}
              />
              {showLabels && (
                <CalloutLayer key={lesson.id} lessonId={lesson.id} callouts={LESSON_SCENES[lesson.id].callouts} elementsRef={calloutsRef} />
              )}
              <div className="pointer-events-none absolute bottom-3 left-0 z-10 hidden md:block">
                <SimControls lesson={lesson} phase={sim.phase} inputs={sim.inputs} outputs={sim.outputs} setInput={sim.setInput} />
              </div>
              <StageToolbar viewRef={viewRef} showLabels={showLabels} onToggleLabels={() => setShowLabels((v) => !v)} />
            </section>

            <div className="md:hidden">
              <SimControls lesson={lesson} phase={sim.phase} inputs={sim.inputs} outputs={sim.outputs} setInput={sim.setInput} />
            </div>

            <aside className="flex min-h-0 w-full min-w-0 flex-col gap-3 overflow-hidden">
              <div className="flex min-h-0 flex-col lg:flex-[1_1_0%]">
                <LessonPanel lesson={lesson} index={safeIndex} />
              </div>
              <div className="flex h-[420px] min-h-0 flex-col lg:h-auto lg:flex-[1.1_1_0%]">
                <CodePanel
                  code={lesson.code}
                  phase={sim.phase}
                  logs={sim.logs}
                  onRun={sim.run}
                  onStop={sim.stop}
                  onCloseMonitor={sim.reset}
                />
              </div>
            </aside>
          </main>
        </div>
      )}
      <SiteFooter />
      <ThanksHost />
    </div>
  )
}
