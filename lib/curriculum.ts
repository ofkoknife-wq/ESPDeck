import { ADVANCED_PACKAGES, ADVANCED_STAGES } from './advanced-lessons'
import type { CurriculumTrack, LessonRecord, Mastery } from './advanced-types'

/** English fallback titles; UI uses messages tracks.* / stages.* via t(). */
export const TRACKS: CurriculumTrack[] = [
  {
    id: 'foundations',
    index: '01',
    title: 'Foundations',
    goal: 'Wire up, see results, finish your first board labs',
    stageIds: [],
    usesBasicLab: true,
  },
  {
    id: 'build',
    index: '02',
    title: 'Build projects',
    goal: 'Ship a reliable sensor node on your own',
    stageIds: ['core', 'sensors'],
    usesBasicLab: false,
  },
  {
    id: 'engineering',
    index: '03',
    title: 'Engineering',
    goal: 'Debuggable, recoverable, networked systems',
    stageIds: ['protocols', 'realtime'],
    usesBasicLab: false,
  },
  {
    id: 'product',
    index: '04',
    title: 'Product hardware',
    goal: 'Power, enclosure, test, and release',
    stageIds: ['product', 'projects'],
    usesBasicLab: false,
  },
]

export function completeLessonIds() {
  return ADVANCED_PACKAGES.filter((lesson) => lesson.complete).map((lesson) => lesson.id)
}

export function orderedAdvancedIds() {
  return ADVANCED_STAGES.flatMap((stage) => stage.lessonIds)
}

export function lessonMastery(id: string, record: LessonRecord | undefined, unlocked: boolean): Mastery {
  if (!unlocked) return 'locked'
  const lesson = ADVANCED_PACKAGES.find((item) => item.id === id)
  if (!lesson) return 'in-progress'
  if (!lesson.complete) return record?.kitAck ? 'passed' : 'in-progress'
  if (!record) return 'in-progress'
  const faultsOk = lesson.faults.length === 0 || lesson.faults.every((fault) => record.faultsSolved.includes(fault.id))
  const challengeOk = record.challengeScore >= lesson.challenge.tests.length
  const quizOk = record.quizScore >= lesson.quiz.passScore
  const rubricOk = !lesson.rubric || lesson.rubric.every((item) => record.rubricChecked.includes(item.id))
  const passed = faultsOk && challengeOk && quizOk && record.kitAck && rubricOk
  if (passed && record.ran) return 'mastered'
  if (passed) return 'passed'
  return 'in-progress'
}

export function trackProgress(trackId: CurriculumTrack['id'], records: Record<string, LessonRecord>, basicDone: number, basicTotal: number) {
  if (trackId === 'foundations') {
    return { done: basicDone, total: basicTotal }
  }
  const track = TRACKS.find((item) => item.id === trackId)!
  const ids = ADVANCED_STAGES.filter((stage) => track.stageIds.includes(stage.id)).flatMap((stage) => stage.lessonIds)
  const done = ids.filter((id) => {
    const mastery = lessonMastery(id, records[id], true)
    return mastery === 'passed' || mastery === 'mastered'
  }).length
  return { done, total: ids.length }
}
