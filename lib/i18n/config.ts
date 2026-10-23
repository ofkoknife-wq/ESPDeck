export const LOCALES = ['en', 'zh-CN', 'ja', 'ko'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_STORAGE_KEY = 'espdeck:locale'

export type LocaleMeta = {
  code: Locale
  label: string
  nativeLabel: string
  flag: string
  enabled: boolean
}

/** Flags + labels; ja/ko reserved for later */
export const LOCALE_META: LocaleMeta[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇺🇸', enabled: true },
  { code: 'zh-CN', label: 'Chinese', nativeLabel: '中文', flag: '🇨🇳', enabled: true },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語', flag: '🇯🇵', enabled: false },
  { code: 'ko', label: 'Korean', nativeLabel: '한국어', flag: '🇰🇷', enabled: false },
]

export function isLocale(value: string | null | undefined): value is Locale {
  return LOCALES.includes(value as Locale)
}

export function resolveLocale(value: string | null | undefined): Locale {
  if (isLocale(value) && LOCALE_META.find((item) => item.code === value)?.enabled) return value
  return DEFAULT_LOCALE
}
