import { LESSONS, type Lesson } from '@/lib/lessons'
import type { Locale } from './config'
import { LESSON_EN } from './lesson-copy-en'

export function getLessons(locale: Locale): Lesson[] {
  if (locale === 'zh-CN') return LESSONS
  return LESSONS.map((lesson) => {
    const copy = LESSON_EN[lesson.id]
    if (!copy) return lesson
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
  })
}
