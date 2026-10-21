'use client'

import dynamic from 'next/dynamic'
import { useRef, useState } from 'react'
import { LESSONS } from '@/lib/lessons'
import { useProgress } from '@/lib/use-progress'
import { useSimulation } from '@/lib/use-simulation'
import { CalloutLayer } from './callout-layer'
import { AdvancedWorkbench } from './advanced-workbench'
import { CodePanel } from './code-panel'
import { LESSON_SCENES } from './three/circuits'
import { Header } from './header'
import { LessonPanel } from './lesson-panel'
import { LessonRail } from './lesson-rail'
import { SimControls } from './sim-controls'
import { StageToolbar } from './stage-toolbar'
import type { ViewApi } from './three/scene'
import { SiteFooter } from '@/components/site/site-footer'
import { ThanksHost } from '@/components/site/thanks-modal'

const Scene = dynamic(() => import('./three/scene'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center font-mono text-sm text-muted-foreground">
      正在加载 3D 场景…
    </div>
  ),
})

export function Lab() {
  const [index, setIndex] = useState(0)
  const [showLabels, setShowLabels] = useState(true)
  const [advanced, setAdvanced] = useState(false)
  const lesson = LESSONS[index]
  const { completed, markComplete, advanced: advancedRecords, patchAdvanced } = useProgress()
  const sim = useSimulation(lesson.id, markComplete)
  const viewRef = useRef<ViewApi | null>(null)
  const calloutsRef = useRef<(HTMLDivElement | null)[]>([])

  return (
    <div className="lab-shell flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <Header
        done={completed.length}
        total={LESSONS.length}
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
      ) : <div className="lab-body flex min-h-0 flex-1 flex-col lg:flex-row">
        <LessonRail activeIndex={index} completed={completed} onSelect={setIndex} />

        <main className="lab-main grid min-h-0 flex-1 grid-cols-1 gap-3 px-4 pb-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:grid-rows-[42px_minmax(0,1fr)] lg:gap-4 lg:px-8 lg:pb-5">
          <div className="workbench-heading col-span-1 flex items-end justify-between gap-4 lg:col-span-2">
            <div>
              <p className="eyebrow">实时电路工作台 / ESP32</p>
              <h2 className="text-xl font-black tracking-tight md:text-2xl">{lesson.title}</h2>
            </div>
            <div className="hidden text-right font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:block">
<div>第 {String(index + 1).padStart(2, '0')} 课 / 共 {String(LESSONS.length).padStart(2, '0')} 课</div>
            <div className="mt-1 text-accent">● 系统已就绪</div>
            </div>
          </div>
          <section aria-label={`第 ${index + 1} 课 3D 电路：${lesson.title}`} className="relative min-h-96 flex-1 lg:min-h-0">
          <Scene
            lessonId={lesson.id}
            outputs={sim.outputs}
            inputs={sim.inputs}
            setInput={sim.setInput}
            viewRef={viewRef}
            calloutsRef={calloutsRef}
          />
          {showLabels && (
            <CalloutLayer key={lesson.id} callouts={LESSON_SCENES[lesson.id].callouts} elementsRef={calloutsRef} />
          )}
          <div className="pointer-events-none absolute bottom-3 left-0 z-10 hidden md:block">
            <SimControls
              lesson={lesson}
              phase={sim.phase}
              inputs={sim.inputs}
              outputs={sim.outputs}
              setInput={sim.setInput}
            />
          </div>
          <StageToolbar
            viewRef={viewRef}
            showLabels={showLabels}
            onToggleLabels={() => setShowLabels((v) => !v)}
          />
        </section>

        <div className="md:hidden">
          <SimControls
            lesson={lesson}
            phase={sim.phase}
            inputs={sim.inputs}
            outputs={sim.outputs}
            setInput={sim.setInput}
          />
        </div>

        <aside className="flex min-w-0 min-h-0 w-full flex-col gap-3 overflow-hidden">
          <div className="flex min-h-0 flex-col lg:flex-[1_1_0%]">
            <LessonPanel lesson={lesson} index={index} />
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
      </div>}
      <SiteFooter />
      <ThanksHost />
    </div>
  )
}
