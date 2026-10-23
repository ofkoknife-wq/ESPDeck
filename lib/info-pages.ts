import { ABOUT_CONTACT_EN, INFO_PAGES_EN, SUPPORT_COPY_EN } from './i18n/info-copy-en'

export type InfoSection = { heading: string; paragraphs: string[] }

export type InfoPage = {
  slug: 'about' | 'guide' | 'terms' | 'privacy'
  title: string
  eyebrow: string
  lead: string
  sections: InfoSection[]
  seoTitle: string
  seoDescription: string
}

/**
 * Canonical structural export is English.
 * Localized pages resolve via getInfoPage / packs in i18n/localize-info.ts.
 */
export const INFO_PAGES = INFO_PAGES_EN
export const ABOUT_CONTACT = ABOUT_CONTACT_EN
export const SUPPORT_COPY = SUPPORT_COPY_EN
