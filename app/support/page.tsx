import type { Metadata } from 'next'
import { DocShell } from '@/components/site/doc-shell'
import { SupportArticle } from '@/components/site/support-article'
import { SUPPORT_COPY_EN } from '@/lib/i18n/info-copy-en'

export const metadata: Metadata = {
  title: SUPPORT_COPY_EN.seoTitle,
  description: SUPPORT_COPY_EN.seoDescription,
}

export default function SupportPage() {
  return (
    <DocShell>
      <SupportArticle />
    </DocShell>
  )
}
