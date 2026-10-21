'use client'

import dynamic from 'next/dynamic'
import { AlertTriangle, ArrowLeft, Check, CircuitBoard, Cpu, Layers } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { AdvancedLessonPackage, TaskStep, ViewMode } from '@/lib/advanced-types'
import { runCodeTests } from '@/lib/code-tests'
import type { LessonRecord } from '@/lib/advanced-types'
import { useAdvancedSimulation } from '@/lib/use-advanced-simulation'
import { cn } from '@/lib/utils'
import { CalloutLayer } from './callout-layer'
import { CodeChallengePanel } from './code-challenge'
import { HardwareKitPanel } from './hardware-kit'
import { InstrumentDock } from './instrument-dock'
import { QuizPanel } from './quiz-panel'
import { PanZoomStage } from './pan-zoom-stage'
import { PcbView } from './pcb-view'
import { SchematicView } from './schematic-view'
import { StageToolbar } from './stage-toolbar'
import { LESSON_SCENES } from './three/circuits'
import type { ViewApi } from './three/scene'

const Scene = dynamic(() => import('./three/scene'), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center font-mono text-sm text-muted-foreground">加载面包板…</div>,
})

const STEPS: { id: TaskStep; label: string }[] = [
  { id: 'observe', label: '观察' },
  { id: 'diagnose', label: '诊断' },
  { id: 'code', label: '补代码' },
  { id: 'quiz', label: '测验' },
  { id: 'hardware', label: '真机' },
]

const VIEWS: { id: ViewMode; label: string; icon: typeof Layers }[] = [
  { id: 'schematic', label: '原理图', icon: Layers },
  { id: 'breadboard', label: '面包板', icon: Cpu },
  { id: 'pcb', label: 'PCB', icon: CircuitBoard },
]

export function AdvancedLessonLab({
  lesson,
  record,
  onPatch,
  onBack,
}: {
  lesson: AdvancedLessonPackage
  record: LessonRecord
  onPatch: (patch: Partial<LessonRecord>) => void
  onBack: () => void
}) {
  const [view, setView] = useState<ViewMode>('schematic')
  const [step, setStep] = useState<TaskStep>('observe')
  const [code, setCode] = useState(lesson.challenge.skeleton)
  const [injected, setInjected] = useState<string | null>(null)
  const [solved, setSolved] = useState<string[]>(record.faultsSolved)
  const [guess, setGuess] = useState('')
  const [showLabels, setShowLabels] = useState(true)
  const viewRef = useRef<ViewApi | null>(null)
  const calloutsRef = useRef<(HTMLDivElement | null)[]>([])
  const sim = useAdvancedSimulation(lesson, code, injected, solved)
  const fault = lesson.faults.find((item) => item.id === injected && !solved.includes(item.id))

  useEffect(() => {
    setCode(lesson.challenge.skeleton)
    setInjected(null)
    setSolved(record.faultsSolved)
    setGuess('')
    setStep('observe')
    setView('schematic')
  }, [lesson.id])

  const tests = useMemo(() => runCodeTests(code, lesson.challenge.tests), [code, lesson])
  const challengeScore = tests.filter((item) => item.ok).length

  const onPatchRef = useRef(onPatch)
  onPatchRef.current = onPatch

  useEffect(() => {
    if (sim.phase === 'running') onPatchRef.current({ ran: true, challengeScore })
  }, [sim.phase, challengeScore])

  useEffect(() => {
    const rubricChecked = (lesson.rubric ?? [])
      .filter((item) => {
        if (item.id === 'wiring') return lesson.faults.every((faultItem) => solved.includes(faultItem.id))
        if (item.id === 'code') return challengeScore >= lesson.challenge.tests.length
        if (item.id === 'quiz') return record.quizScore >= lesson.quiz.passScore
        if (item.id === 'run') return record.ran || sim.phase === 'running'
        if (item.id === 'kit') return record.kitAck
        return false
      })
      .map((item) => item.id)
    onPatchRef.current({ rubricChecked, faultsSolved: solved, challengeScore })
  }, [lesson, solved, challengeScore, record.quizScore, record.ran, record.kitAck, sim.phase])

  const inject = () => {
    const pending = lesson.faults.filter((item) => !solved.includes(item.id))
    if (pending.length === 0) {
      setGuess('全部故障已定位')
      return
    }
    const next = pending[Math.floor(Math.random() * pending.length)]
    setInjected(next.id)
    setGuess('电路行为异常。用仪器和点击网表定位，不要先看答案。')
    setStep('diagnose')
    sim.run()
  }

  const tryFix = (kind: 'net' | 'part', id: string) => {
    if (!fault) {
      setGuess('当前没有注入故障。可以先观察健康电路。')
      return
    }
    const ok =
      (fault.passBy === 'click-net' && kind === 'net' && fault.netId === id) ||
      (fault.passBy === 'click-part' && kind === 'part' && fault.partId === id)
    if (ok) {
      const next = [...new Set([...solved, fault.id])]
      setSolved(next)
      setInjected(null)
      setGuess(`定位成功：${fault.title}`)
      onPatch({ faultsSolved: next })
      return
    }
    if (fault.passBy === 'code') {
      setGuess('这个故障要在代码里修：补全关键函数后再看串口/示波器是否干净。')
      setStep('code')
      return
    }
    setGuess('不是这里。对照示波器和串口再选一条网或一个器件。')
  }

  const markCodeFaults = () => {
    if (challengeScore < lesson.challenge.tests.length) return
    const codeFaults = lesson.faults.filter((item) => item.passBy === 'code').map((item) => item.id)
    if (codeFaults.length === 0) return
    const next = [...new Set([...solved, ...codeFaults])]
    setSolved(next)
    onPatch({ faultsSolved: next, challengeScore })
  }

  useEffect(() => {
    markCodeFaults()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeScore, lesson.id])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2">
        <button onClick={onBack} className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-bold hover:bg-secondary">
          <ArrowLeft className="size-4" /> 路线图
        </button>
        <div className="min-w-0">
          <p className="eyebrow">{lesson.type} · {lesson.complete ? '完整工位' : '占位课'}</p>
          <h2 className="truncate text-lg font-black">{lesson.title}</h2>
        </div>
        <div className="ml-auto flex gap-1 rounded-lg border bg-background p-1">
          {VIEWS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={cn('flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold', view === id && 'bg-foreground text-background')}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto px-4 py-2">
        {STEPS.map((item, index) => (
          <button
            key={item.id}
            onClick={() => setStep(item.id)}
            className={cn('rounded-full px-3 py-1 text-xs font-bold', step === item.id ? 'bg-primary text-primary-foreground' : 'bg-secondary')}
          >
            {index + 1} {item.label}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 gap-3 overflow-auto px-4 pb-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="flex min-h-96 flex-col gap-3">
          <section className="relative min-h-80 flex-1 overflow-hidden rounded-[1.25rem] border bg-card">
            {view !== 'breadboard' ? (
              <PanZoomStage key={view} hint="拖动平移 · 滚轮缩放 · 双击复位">
                {(viewBox) =>
                  view === 'schematic' ? (
                    <SchematicView
                      graph={lesson.graph}
                      fault={fault}
                      solved={solved}
                      viewBox={viewBox}
                      onSelectNet={(id) => tryFix('net', id)}
                      onSelectPart={(id) => tryFix('part', id)}
                    />
                  ) : (
                    <PcbView
                      graph={lesson.graph}
                      fault={fault}
                      viewBox={viewBox}
                      onSelectNet={(id) => tryFix('net', id)}
                      onSelectPart={(id) => tryFix('part', id)}
                    />
                  )
                }
              </PanZoomStage>
            ) : (
              <>
                <Scene
                  lessonId={lesson.sceneLessonId}
                  outputs={sim.outputs}
                  inputs={sim.inputs}
                  setInput={sim.setInput}
                  viewRef={viewRef}
                  calloutsRef={calloutsRef}
                />
                {showLabels && (
                  <CalloutLayer key={lesson.sceneLessonId} callouts={LESSON_SCENES[lesson.sceneLessonId].callouts} elementsRef={calloutsRef} />
                )}
                <StageToolbar viewRef={viewRef} showLabels={showLabels} onToggleLabels={() => setShowLabels((value) => !value)} />
              </>
            )}
          </section>
          <InstrumentDock outputs={sim.outputs} logs={sim.logs} phase={sim.phase} enabled={lesson.tools} />
        </div>

        <aside className="flex min-h-0 flex-col overflow-hidden rounded-[1.25rem] border bg-card p-4">
          <p className="text-sm leading-relaxed text-muted-foreground">{step === 'observe' ? lesson.description : lesson.summary}</p>

          {step === 'observe' && (
            <div className="mt-4 space-y-3 text-sm">
              <p>{lesson.goal}</p>
              <div className="flex gap-2">
                <button onClick={() => sim.run()} className="rounded-xl bg-primary px-3 py-2 font-bold text-primary-foreground">
                  运行健康电路
                </button>
                <button onClick={inject} className="rounded-xl border px-3 py-2 font-bold">
                  注入故障
                </button>
              </div>
              {!lesson.complete && <p className="rounded-lg bg-secondary p-3 text-xs">完整三视图与故障库将按本课模板补齐。测验与真机页仍可体验评分流程。</p>}
            </div>
          )}

          {step === 'diagnose' && (
            <div className="mt-4 space-y-3">
              <button onClick={inject} className="flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm font-bold text-accent-foreground">
                <AlertTriangle className="size-4" /> {fault ? '换一个未知故障' : '注入未知故障'}
              </button>
              <p className="text-sm">{guess || '注入后点击原理图或 PCB 上的网/器件。'}</p>
              <div className="flex flex-wrap gap-1.5">
                {lesson.graph.nets.map((net) => (
                  <button key={net.id} onClick={() => tryFix('net', net.id)} className="rounded-lg border px-2 py-1 text-xs font-bold">
                    测 {net.label}
                  </button>
                ))}
                {lesson.graph.parts
                  .filter((part) => part.kind !== 'mcu')
                  .map((part) => (
                    <button key={part.id} onClick={() => tryFix('part', part.id)} className="rounded-lg border px-2 py-1 text-xs font-bold">
                      查 {part.label}
                    </button>
                  ))}
              </div>
              <ul className="space-y-1 text-xs">
                {lesson.faults.map((item) => (
                  <li key={item.id} className="flex items-center gap-2">
                    {solved.includes(item.id) ? <Check className="size-3 text-emerald-600" /> : <span className="size-3 rounded-full border" />}
                    {solved.includes(item.id) ? item.title : '未定位故障'}
                    {solved.includes(item.id) && <span className="text-muted-foreground">· {item.symptoms[0]}</span>}
                  </li>
                ))}
              </ul>
              {fault?.passBy === 'code' && <p className="text-xs text-accent">当前故障需要在「补代码」里修复。</p>}
            </div>
          )}

          {step === 'code' && (
            <div className="mt-3 flex min-h-0 flex-1 flex-col">
              <CodeChallengePanel
                challenge={lesson.challenge}
                code={code}
                onChange={setCode}
                phase={sim.phase}
                onRun={sim.run}
                onStop={sim.stop}
              />
            </div>
          )}

          {step === 'quiz' && (
            <div className="mt-3 min-h-0 flex-1 overflow-auto">
              <QuizPanel quiz={lesson.quiz} savedScore={record.quizScore} onScored={(quizScore) => onPatch({ quizScore })} />
            </div>
          )}

          {step === 'hardware' && (
            <div className="mt-3 min-h-0 flex-1 overflow-auto">
              <HardwareKitPanel kit={lesson.kit} acked={record.kitAck} onAck={() => onPatch({ kitAck: true })} />
              {lesson.rubric && (
                <ul className="mt-4 space-y-2 text-sm">
                  {lesson.rubric.map((item) => (
                    <li key={item.id} className="flex gap-2">
                      <span className={cn('mt-0.5 size-4 rounded-full border', record.rubricChecked.includes(item.id) && 'bg-primary')} />
                      <span>
                        <span className="font-bold">{item.label}</span>
                        <span className="block text-xs text-muted-foreground">{item.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

