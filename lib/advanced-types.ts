import type { LessonId } from './lessons'
import type { LucideIcon } from 'lucide-react'

export type ViewMode = 'schematic' | 'breadboard' | 'pcb'
export type TaskStep = 'observe' | 'diagnose' | 'code' | 'quiz' | 'hardware'
export type Mastery = 'locked' | 'in-progress' | 'passed' | 'mastered'
export type FaultKind = 'open' | 'wrong-value' | 'wrong-pin' | 'address-conflict' | 'floating'
export type PartKind = 'mcu' | 'oled' | 'button' | 'led' | 'resistor' | 'pot' | 'dht' | 'pullup' | 'device' | 'usb'

export type CircuitPart = {
  id: string
  kind: PartKind
  label: string
  value?: string
  x: number
  y: number
}

export type CircuitNet = {
  id: string
  label: string
  from: string
  to: string
  color: string
}

export type CircuitGraph = {
  parts: CircuitPart[]
  nets: CircuitNet[]
}

export type Fault = {
  id: string
  title: string
  kind: FaultKind
  netId?: string
  partId?: string
  symptoms: string[]
  passBy: 'click-net' | 'click-part' | 'code'
}

export type CodeTest = {
  name: string
  includes?: string[]
  regex?: string
}

export type CodeGuideStep = {
  title: string
  body: string
}

export type CodeChallenge = {
  skeleton: string
  holes: { id: string; hint: string }[]
  tests: CodeTest[]
  /** 完整参考答案，可一键复制 */
  solution: string
  /** 代码放哪、怎么改的分步提示 */
  guide: CodeGuideStep[]
}

export type QuizQuestion = {
  prompt: string
  choices: string[]
  answer: number
  explain: string
}

export type Quiz = {
  questions: QuizQuestion[]
  passScore: number
}

export type HardwareKit = {
  bom: { item: string; qty: number; note: string }[]
  safety: string[]
  analogToReal: string[]
}

export type ProjectRubric = {
  id: string
  label: string
  detail: string
}[]

export type AdvancedLessonPackage = {
  id: string
  stageId: string
  title: string
  type: string
  goal: string
  summary: string
  description: string
  complete: boolean
  sceneLessonId: LessonId
  graph: CircuitGraph
  faults: Fault[]
  challenge: CodeChallenge
  quiz: Quiz
  kit: HardwareKit
  rubric?: ProjectRubric
  tools: Array<'scope' | 'serial' | 'power' | 'network'>
}

export type CurriculumTrack = {
  id: 'foundations' | 'build' | 'engineering' | 'product'
  index: string
  title: string
  goal: string
  stageIds: string[]
  usesBasicLab: boolean
}

export type AdvancedStage = {
  id: string
  trackId: CurriculumTrack['id']
  index: string
  title: string
  goal: string
  project: string
  color: string
  icon: LucideIcon
  lessonIds: string[]
}

export type LessonRecord = {
  ran: boolean
  faultsSolved: string[]
  challengeScore: number
  quizScore: number
  kitAck: boolean
  rubricChecked: string[]
}
