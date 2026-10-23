import type { Metadata } from 'next'
import { DocShell } from '@/components/site/doc-shell'
import { InfoArticle } from '@/components/site/info-article'
import { INFO_PAGES_EN } from '@/lib/i18n/info-copy-en'

const page = INFO_PAGES_EN.terms

export const metadata: Metadata = {
  title: page.seoTitle,
  description: page.seoDescription,
}

export default function TermsPage() {
  return (
    <DocShell>
      <InfoArticle slug="terms" />
    </DocShell>
  )
}
