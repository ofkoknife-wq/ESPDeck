import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { DocShell } from '@/components/site/doc-shell'
import { ABOUT_CONTACT, INFO_PAGES } from '@/lib/info-pages'
import { SITE_URL, SUPPORT_EMAIL } from '@/lib/site'

const page = INFO_PAGES.about

export const metadata: Metadata = {
  title: page.seoTitle,
  description: page.seoDescription,
}

export default function AboutPage() {
  return (
    <DocShell>
      <article className="prose-lab">
        <p className="eyebrow">开发故事</p>
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
        <section>
          <h2>{ABOUT_CONTACT.heading}</h2>
          <p>{ABOUT_CONTACT.intro}</p>
          <ul className="about-contact">
            <li>
              {ABOUT_CONTACT.siteLabel}
              <a href={SITE_URL} target="_blank" rel="noopener noreferrer">
                espdeck.pixzens.com
              </a>
            </li>
            <li>
              {ABOUT_CONTACT.mailLabel}
              <a href={`mailto:${SUPPORT_EMAIL}`}>
                <Mail className="size-3.5" aria-hidden />
                {SUPPORT_EMAIL}
              </a>
            </li>
            <li>
              {ABOUT_CONTACT.inspirationLabel}
              <a href={ABOUT_CONTACT.inspirationHref} target="_blank" rel="noopener noreferrer">
                {ABOUT_CONTACT.inspirationName}
              </a>
            </li>
          </ul>
          <p>
            <Link href="/support">{ABOUT_CONTACT.supportLink}</Link>
          </p>
        </section>
        <p className="updated">最后更新：2026 年 10 月</p>
      </article>
    </DocShell>
  )
}
