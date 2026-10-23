import { LESSONS, type Lesson, type LessonId } from '@/lib/lessons'
import type { Locale } from './config'
import { resolveContentRecord } from './content/resolve'
import { LESSON_CODES_EN } from './content/en/lesson-codes'
import { LESSONS_EN, type LessonCopy } from './content/en/lessons'

function copyFromLesson(lesson: Lesson): LessonCopy {
  return {
    title: lesson.title,
    summary: lesson.summary,
    description: lesson.description,
    points: lesson.points.map((point) => point.text),
    wiring: lesson.wiring.map((wire) => ({ from: wire.from, to: wire.to, note: wire.note })),
    steps: [...lesson.steps],
    specs: lesson.specs.map((spec) => ({ label: spec.label, value: spec.value })),
    hint: lesson.hint,
  }
}

/** zh-CN pack is derived from the structural LESSONS array (Chinese authoring copy). */
const LESSONS_ZH: Record<string, LessonCopy> = Object.fromEntries(LESSONS.map((lesson) => [lesson.id, copyFromLesson(lesson)]))

const LESSON_PACKS: Partial<Record<Locale, Record<string, LessonCopy>>> = {
  en: LESSONS_EN as Record<string, LessonCopy>,
  'zh-CN': LESSONS_ZH,
  // ja / ko: add content/{locale}/lessons.ts and register here — missing → en via resolveContentRecord
}

function applyCopy(lesson: Lesson, copy: LessonCopy, locale: Locale): Lesson {
  const englishCode = LESSON_CODES_EN[lesson.id as LessonId]
  // Prefer locale pack arrays wholesale so missing note/extra Chinese rows never leak into EN.
  const wiring =
    copy.wiring.length > 0
      ? copy.wiring.map((wire) => ({ from: wire.from, to: wire.to, note: wire.note }))
      : lesson.wiring
  const points =
    copy.points.length > 0
      ? copy.points.map((text, index) => ({
          icon: lesson.points[index]?.icon ?? lesson.points[0]!.icon,
          text,
          code: lesson.points[index]?.code,
        }))
      : lesson.points
  const specs =
    copy.specs.length > 0
      ? copy.specs.map((spec) => ({ label: spec.label, value: spec.value }))
      : lesson.specs
  return {
    ...lesson,
    title: copy.title,
    summary: copy.summary,
    description: copy.description,
    points,
    wiring,
    steps: copy.steps.length ? copy.steps : lesson.steps,
    specs,
    hint: copy.hint ?? lesson.hint,
    // zh keeps authoring sketches; other locales prefer English code when available
    code: locale === 'zh-CN' ? lesson.code : (englishCode ?? lesson.code),
  }
}

/**
 * Build localized lessons. Structure (icons) comes from LESSONS;
 * user-facing strings + sketch source come from locale packs with English fallback.
 */
export function getLessons(locale: Locale): Lesson[] {
  return LESSONS.map((lesson) => {
    const copy =
      resolveContentRecord(locale, lesson.id, LESSON_PACKS) ??
      LESSONS_EN[lesson.id as LessonId] ??
      copyFromLesson(lesson)
    return applyCopy(lesson, copy, locale)
  })
}
