import { DEFAULT_LOCALE, type Locale } from '../config'

/**
 * Resolve locale-specific content with English fallback.
 * Add a new language by shipping a pack file; missing entries fall back to en.
 */
export function resolveContent<T>(locale: Locale, load: (l: Locale) => T | undefined): T {
  const hit = load(locale)
  if (hit !== undefined) return hit
  if (locale !== DEFAULT_LOCALE) {
    const fallback = load(DEFAULT_LOCALE)
    if (fallback !== undefined) return fallback
  }
  throw new Error(`Missing content pack for locale=${locale} (and no ${DEFAULT_LOCALE} fallback)`)
}

export function resolveContentRecord<T>(
  locale: Locale,
  id: string,
  packs: Partial<Record<Locale, Record<string, T> | undefined>>,
): T | undefined {
  const local = packs[locale]?.[id]
  if (local !== undefined) return local
  if (locale !== DEFAULT_LOCALE) return packs[DEFAULT_LOCALE]?.[id]
  return undefined
}
