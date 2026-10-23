import type { AdvancedLessonPackage } from '@/lib/advanced-types'
import { getAdvancedLesson } from '@/lib/advanced-lessons'
import type { Locale } from './config'
import { ADVANCED_EN_PACK, type AdvancedCopy } from './content/en/advanced'
import { resolveContentRecord } from './content/resolve'

const ADVANCED_PACKS: Partial<Record<Locale, Record<string, AdvancedCopy>>> = {
  en: ADVANCED_EN_PACK,
  // zh-CN: Chinese lives on the package itself (getAdvancedLesson)
  // ja / ko: add content/{locale}/advanced.ts and register here
}

function asCopy(lesson: AdvancedLessonPackage): AdvancedCopy {
  return {
    title: lesson.title,
    type: lesson.type,
    goal: lesson.goal,
    summary: lesson.summary,
    description: lesson.description,
  }
}

/**
 * Advanced lesson with locale text overlay.
 * English pack is canonical for non-zh locales; zh-CN uses source package strings.
 */
export function getLocalizedAdvancedLesson(id: string, locale: Locale): AdvancedLessonPackage | undefined {
  const lesson = getAdvancedLesson(id)
  if (!lesson) return undefined
  if (locale === 'zh-CN') return lesson

  const copy =
    resolveContentRecord(locale, id, ADVANCED_PACKS) ??
    ADVANCED_EN_PACK[id] ??
    asCopy(lesson)

  return {
    ...lesson,
    title: copy.title,
    type: copy.type,
    goal: copy.goal,
    summary: copy.summary,
    description: copy.description,
  }
}
