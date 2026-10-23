import type { InfoPage } from '@/lib/info-pages'
import type { Locale } from './config'
import { ABOUT_CONTACT_EN, INFO_PAGES_EN, SUPPORT_COPY_EN } from './info-copy-en'
import { ABOUT_CONTACT_ZH, INFO_PAGES_ZH, SUPPORT_COPY_ZH } from './info-copy-zh'

/**
 * Info page packs. English is fallback; zh-CN is a peer pack (not “source special”).
 * Add ja/ko by shipping info-copy-{locale}.ts and registering here.
 */
const INFO_PACKS: Partial<Record<Locale, Record<InfoPage['slug'], InfoPage>>> = {
  en: INFO_PAGES_EN,
  'zh-CN': INFO_PAGES_ZH,
}

const CONTACT_PACKS: Partial<Record<Locale, typeof ABOUT_CONTACT_EN>> = {
  en: ABOUT_CONTACT_EN,
  'zh-CN': ABOUT_CONTACT_ZH,
}

const SUPPORT_PACKS: Partial<Record<Locale, typeof SUPPORT_COPY_EN>> = {
  en: SUPPORT_COPY_EN,
  'zh-CN': SUPPORT_COPY_ZH,
}

export function getInfoPage(slug: InfoPage['slug'], locale: Locale): InfoPage {
  return INFO_PACKS[locale]?.[slug] ?? INFO_PAGES_EN[slug]
}

export function getAboutContact(locale: Locale) {
  return CONTACT_PACKS[locale] ?? ABOUT_CONTACT_EN
}

export function getSupportCopy(locale: Locale) {
  return SUPPORT_PACKS[locale] ?? SUPPORT_COPY_EN
}
