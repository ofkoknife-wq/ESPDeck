import { LESSONS, type Lesson, type LessonId } from '@/lib/lessons'
import type { Locale } from './config'
import { resolveContentRecord } from './content/resolve'
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

function applyCopy(lesson: Lesson, copy: LessonCopy): Lesson {
  return {
    ...lesson,
    title: copy.title,
    summary: copy.summary,
    description: copy.description,
    points: lesson.points.map((point, index) => ({
      ...point,
      text: copy.points[index] ?? point.text,
    })),
    wiring: lesson.wiring.map((wire, index) => ({
      ...wire,
      from: copy.wiring[index]?.from ?? wire.from,
      to: copy.wiring[index]?.to ?? wire.to,
      note: copy.wiring[index]?.note ?? wire.note,
    })),
    steps: copy.steps.length ? copy.steps : lesson.steps,
    specs: lesson.specs.map((spec, index) => ({
      label: copy.specs[index]?.label ?? spec.label,
      value: copy.specs[index]?.value ?? spec.value,
    })),
    hint: copy.hint ?? lesson.hint,
  }
}

/**
 * Build localized lessons. Structure (code, icons) comes from LESSONS;
 * user-facing strings come from locale packs with English fallback.
 */
export function getLessons(locale: Locale): Lesson[] {
  return LESSONS.map((lesson) => {
    const copy =
      resolveContentRecord(locale, lesson.id, LESSON_PACKS) ??
      LESSONS_EN[lesson.id as LessonId] ??
      copyFromLesson(lesson)
    return applyCopy(lesson, copy)
  })
}
