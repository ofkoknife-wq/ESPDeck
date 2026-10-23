import type { LessonId } from '@/lib/lessons'
import type { Locale } from '../config'
import { resolveContentRecord } from './resolve'
import { CALLOUTS_EN, type CalloutText } from './en/callouts'
import { CALLOUTS_JA } from './ja/callouts'
import { CALLOUTS_KO } from './ko/callouts'
import { CALLOUTS_ZH } from './zh-CN/callouts'

const PACKS: Partial<Record<Locale, Partial<Record<LessonId, CalloutText[]>>>> = {
  en: CALLOUTS_EN,
  'zh-CN': CALLOUTS_ZH,
  ja: CALLOUTS_JA,
  ko: CALLOUTS_KO,
}

/** Resolve callout copy by lesson id; falls back to English pack. */
export function getCalloutTexts(lessonId: LessonId, locale: Locale): CalloutText[] {
  const pack = resolveContentRecord(locale, lessonId, PACKS as Partial<Record<Locale, Record<string, CalloutText[]>>>)
  return pack ?? CALLOUTS_EN[lessonId] ?? []
}

export type { CalloutText }
