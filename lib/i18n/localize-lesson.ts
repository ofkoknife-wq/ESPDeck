import { LESSONS, type Lesson, type LessonId } from '@/lib/lessons'
import type { Locale } from './config'
import { resolveContentRecord } from './content/resolve'
import { LESSON_CODES_EN } from './content/en/lesson-codes'
import { LESSONS_EN, type LessonCopy } from './content/en/lessons'
import { LESSON_CODES_ZH } from './content/zh-CN/lesson-codes'
import { LESSONS_ZH } from './content/zh-CN/lessons'

/**
 * Locale content packs. Structure (icons, ids) lives in LESSONS;
 * user-facing copy + sketch source come only from packs.
 * Add ja/ko by shipping content/{locale}/lessons.ts (+ lesson-codes) and registering here.
 */
const LESSON_PACKS: Partial<Record<Locale, Record<string, LessonCopy>>> = {
  en: LESSONS_EN as Record<string, LessonCopy>,
  'zh-CN': LESSONS_ZH as Record<string, LessonCopy>,
}

const CODE_PACKS: Partial<Record<Locale, Partial<Record<LessonId, string>>>> = {
  en: LESSON_CODES_EN,
  'zh-CN': LESSON_CODES_ZH,
}

function applyCopy(lesson: Lesson, copy: LessonCopy, code: string | undefined): Lesson {
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
    code: code ?? lesson.code,
  }
}

/** Build localized lessons from locale packs with English fallback. */
export function getLessons(locale: Locale): Lesson[] {
  return LESSONS.map((lesson) => {
    const id = lesson.id as LessonId
    const copy =
      resolveContentRecord(locale, id, LESSON_PACKS) ??
      LESSONS_EN[id] ??
      ({
        title: lesson.title,
        summary: lesson.summary,
        description: lesson.description,
        points: lesson.points.map((p) => p.text),
        wiring: lesson.wiring.map((w) => ({ from: w.from, to: w.to, note: w.note })),
        steps: [...lesson.steps],
        specs: lesson.specs.map((s) => ({ label: s.label, value: s.value })),
        hint: lesson.hint,
      } satisfies LessonCopy)
    const code =
      resolveContentRecord(locale, id, CODE_PACKS as Partial<Record<Locale, Record<string, string>>>) ??
      LESSON_CODES_EN[id] ??
      lesson.code
    return applyCopy(lesson, copy, code)
  })
}
