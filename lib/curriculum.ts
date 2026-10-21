import { ADVANCED_PACKAGES, ADVANCED_STAGES } from './advanced-lessons'
import type { CurriculumTrack, LessonRecord, Mastery } from './advanced-types'

export const TRACKS: CurriculumTrack[] = [
  {
    id: 'foundations',
    index: '01',
    title: '零基础',
    goal: '接线并看现象，完成第一块开发板实验',
    stageIds: [],
    usesBasicLab: true,
  },
  {
    id: 'build',
    index: '02',
    title: '能做项目',
    goal: '独立做出可靠的传感器节点',
    stageIds: ['core', 'sensors'],
    usesBasicLab: false,
  },
  {
    id: 'engineering',
    index: '03',
    title: '工程化开发',
    goal: '可调试、可恢复、可联网',
    stageIds: ['protocols', 'realtime'],
    usesBasicLab: false,
  },
  {
    id: 'product',
    index: '04',
    title: '产品级硬件',
    goal: '功耗、结构、测试与发布',
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

export function isLessonUnlocked(id: string, records: Record<string, LessonRecord>) {
  const playable = completeLessonIds()
  const index = playable.indexOf(id)
  if (index < 0) return true
  if (index === 0) return true
  const previousId = playable[index - 1]
  const previous = lessonMastery(previousId, records[previousId], true)
  return previous === 'passed' || previous === 'mastered'
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
