import type { AdvancedLessonPackage } from '@/lib/advanced-types'
import { getAdvancedLesson } from '@/lib/advanced-lessons'
import { FILL_SPECS, buildFillLesson } from '@/lib/advanced-fill'
import type { Locale } from './config'
import { applyHandDeep, HAND_ADVANCED_EN, type HandDeep } from './advanced-hand-en'
import { HAND_ADVANCED_ZH } from './advanced-hand-zh'

/**
 * Hand deep packs by locale. Add ja/ko the same way — register a pack, English fallback.
 */
const HAND_PACKS: Partial<Record<Locale, Record<string, HandDeep>>> = {
  en: HAND_ADVANCED_EN,
  'zh-CN': HAND_ADVANCED_ZH as Record<string, HandDeep>,
}

/**
 * Localized advanced lesson.
 * Every locale (including zh-CN) resolves through packs — no language is “source special”.
 * Missing locale content falls back to English.
 */
export function getLocalizedAdvancedLesson(id: string, locale: Locale): AdvancedLessonPackage | undefined {
  const fillSpec = FILL_SPECS.find((spec) => spec.id === id)
  if (fillSpec) return buildFillLesson(fillSpec, locale)

  const lesson = getAdvancedLesson(id)
  if (!lesson) return undefined

  const pack = HAND_PACKS[locale]?.[id] ?? HAND_ADVANCED_EN[id]
  return applyHandDeep(lesson, pack)
}
