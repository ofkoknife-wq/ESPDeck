import {
  ABOUT_CONTACT,
  INFO_PAGES,
  SUPPORT_COPY,
  type InfoPage,
} from '@/lib/info-pages'
import type { Locale } from './config'
import { ABOUT_CONTACT_EN, INFO_PAGES_EN, SUPPORT_COPY_EN } from './info-copy-en'

export function getInfoPage(slug: InfoPage['slug'], locale: Locale): InfoPage {
  if (locale === 'zh-CN') return INFO_PAGES[slug]
  return INFO_PAGES_EN[slug]
}

export function getAboutContact(locale: Locale) {
  return locale === 'zh-CN' ? ABOUT_CONTACT : ABOUT_CONTACT_EN
}

export function getSupportCopy(locale: Locale) {
  return locale === 'zh-CN' ? SUPPORT_COPY : SUPPORT_COPY_EN
}
