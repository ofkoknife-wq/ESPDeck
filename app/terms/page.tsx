import type { Metadata } from 'next'
import { DocShell } from '@/components/site/doc-shell'
import { INFO_PAGES } from '@/lib/info-pages'

const page = INFO_PAGES.terms

export const metadata: Metadata = {
  title: page.seoTitle,
  description: page.seoDescription,
}

export default function TermsPage() {
  return (
    <DocShell>
      <article className="prose-lab">
        <p className="eyebrow">条款</p>
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
        <p className="updated">最后更新：2026 年 10 月</p>
      </article>
    </DocShell>
  )
}
