'use client'

import Link from 'next/link'
import { getAboutContact, getInfoPage } from '@/lib/i18n/localize-info'
import { useI18n } from '@/lib/i18n/provider'
import type { InfoPage } from '@/lib/info-pages'
import { SITE_URL, SUPPORT_EMAIL } from '@/lib/site'

export function InfoArticle({ slug, showContact }: { slug: InfoPage['slug']; showContact?: boolean }) {
  const { locale, t } = useI18n()
  const page = getInfoPage(slug, locale)
  const contact = getAboutContact(locale)

  return (
    <article className="prose-lab">
      <p className="eyebrow">{page.eyebrow}</p>
      <h1>{page.title}</h1>
      <p className="lead">{page.lead}</p>
      {page.sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </section>
      ))}
      {showContact && (
        <section>
          <h2>{contact.heading}</h2>
          <p>{contact.intro}</p>
          <ul className="about-contact">
            <li>
              {contact.siteLabel}
              <a href={SITE_URL} target="_blank" rel="noopener noreferrer">
                espdeck.pixzens.com
              </a>
            </li>
            <li>
              {contact.mailLabel}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            </li>
          </ul>
          <p>
            <Link href="/support">{contact.supportLink}</Link>
          </p>
        </section>
      )}
      <p className="updated">{t('info.updated')}</p>
    </article>
  )
}
