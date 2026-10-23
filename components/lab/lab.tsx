'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SiteFooter } from '@/components/site/site-footer'
import { ThanksHost } from '@/components/site/thanks-modal'
import { getLessonDiagram } from '@/lib/lesson-diagrams'
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
import { PanZoomStage } from './pan-zoom-stage'
import { PartInspectCard } from './part-inspect-card'
import { PinoutView } from './pinout-view'
import { SchematicView } from './schematic-view'
import { ScenePartsPanel } from './scene-parts-panel'
import type { ScenePart } from './scene-parts'
import { SimControls } from './sim-controls'
import { StageTitleBar } from './stage-title-bar'
import { StageToolbar, type StageViewMode } from './stage-toolbar'
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
  const [showParts, setShowParts] = useState(true)
  const [advanced, setAdvanced] = useState(false)
  const [stageMode, setStageMode] = useState<StageViewMode>('scene')
  const [focusedPart, setFocusedPart] = useState<ScenePart | null>(null)
  const safeIndex = Math.min(index, lessons.length - 1)
  const lesson = lessons[safeIndex]
  const diagram = useMemo(() => getLessonDiagram(lesson.id), [lesson.id])
  const { completed, markComplete, advanced: advancedRecords, patchAdvanced } = useProgress()
  const sim = useSimulation(lesson.id, markComplete)
  const viewRef = useRef<ViewApi | null>(null)
  const calloutsRef = useRef<(HTMLDivElement | null)[]>([])
  const focusTargetRef = useRef<[number, number, number] | null>(null)
  const focusElRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setFocusedPart(null)
    focusTargetRef.current = null
    setStageMode('scene')
  }, [lesson.id])

  const focusPart = (part: ScenePart) => {
    setFocusedPart(part)
    focusTargetRef.current = part.at
    setShowLabels(true)
    viewRef.current?.focusAt(part.at)
  }

  const clearFocus = () => {
    setFocusedPart(null)
    focusTargetRef.current = null
  }

  const openDiagram = (mode: Extract<StageViewMode, 'schematic' | 'pinout'>) => {
    setStageMode(mode)
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
      document.getElementById('lab-stage')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

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

          <main className="lab-main grid min-h-0 flex-1 grid-cols-1 gap-4 px-4 pb-4 pt-3 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)] lg:grid-rows-[minmax(0,1fr)] lg:gap-5 lg:px-8 lg:pb-5 lg:pt-4">
            <section
              id="lab-stage"
              aria-label={`${t('lab.lessonN', { n: safeIndex + 1 })} · ${lesson.title}`}
              className="relative min-h-96 flex-1 overflow-hidden rounded-[1.35rem] border border-border bg-card shadow-[var(--elevated-shadow)] lg:min-h-0"
            >
              {stageMode === 'scene' ? (
                <>
                  <Scene
                    lessonId={lesson.id}
                    outputs={sim.outputs}
                    inputs={sim.inputs}
                    setInput={sim.setInput}
                    viewRef={viewRef}
                    calloutsRef={calloutsRef}
                    focusTargetRef={focusTargetRef}
                    focusElRef={focusElRef}
                  />
                  {showLabels && (
                    <CalloutLayer
                      key={lesson.id}
                      lessonId={lesson.id}
                      callouts={LESSON_SCENES[lesson.id].callouts}
                      elementsRef={calloutsRef}
                      highlightIndex={focusedPart?.calloutIndex ?? null}
                    />
                  )}
                  <PartInspectCard part={focusedPart} viewRef={viewRef} elRef={focusElRef} onClose={clearFocus} />
                  <ScenePartsPanel
                    lessonId={lesson.id}
                    open={showParts}
                    focusedKey={focusedPart?.key ?? null}
                    onFocus={focusPart}
                  />
                  <div className="pointer-events-none absolute bottom-3 left-0 z-10 hidden md:block">
                    <SimControls lesson={lesson} phase={sim.phase} inputs={sim.inputs} outputs={sim.outputs} setInput={sim.setInput} />
                  </div>
                </>
              ) : (
                <PanZoomStage key={`${lesson.id}-${stageMode}`}>
                  {(viewBox) =>
                    stageMode === 'schematic' ? (
                      <SchematicView graph={diagram.schematic} viewBox={viewBox} />
                    ) : (
                      <PinoutView activePins={diagram.pins} viewBox={viewBox} />
                    )
                  }
                </PanZoomStage>
              )}
              <StageTitleBar index={safeIndex} total={lessons.length} title={lesson.title} />
              <StageToolbar
                viewRef={viewRef}
                showLabels={showLabels}
                onToggleLabels={() => setShowLabels((v) => !v)}
                showParts={showParts}
                onToggleParts={() => setShowParts((v) => !v)}
                mode={stageMode}
                onModeChange={setStageMode}
                showCameraControls={stageMode === 'scene'}
              />
            </section>

            <div className="md:hidden">
              <SimControls lesson={lesson} phase={sim.phase} inputs={sim.inputs} outputs={sim.outputs} setInput={sim.setInput} />
            </div>

            <aside className="flex min-h-0 w-full min-w-0 flex-col gap-3 overflow-hidden">
              <div className="flex min-h-0 flex-col lg:flex-[1_1_0%]">
                <LessonPanel
                  lesson={lesson}
                  index={safeIndex}
                  total={lessons.length}
                  stageMode={stageMode}
                  onOpenDiagram={openDiagram}
                  onBackToScene={() => setStageMode('scene')}
                />
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
