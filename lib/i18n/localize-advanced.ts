import type { AdvancedLessonPackage } from '@/lib/advanced-types'
import { getAdvancedLesson } from '@/lib/advanced-lessons'
import type { Locale } from './config'
import { advancedTextCopy } from './advanced-copy-en'

export function getLocalizedAdvancedLesson(id: string, locale: Locale): AdvancedLessonPackage | undefined {
  const lesson = getAdvancedLesson(id)
  if (!lesson) return undefined
  if (locale === 'zh-CN') return lesson
  const copy = advancedTextCopy(lesson.id, {
    title: lesson.title,
    type: lesson.type,
    goal: lesson.goal,
    summary: lesson.summary,
    description: lesson.description,
  })
  return {
    ...lesson,
    title: copy.title,
    type: copy.type,
    goal: copy.goal,
    summary: copy.summary,
    description: copy.description,
  }
}
