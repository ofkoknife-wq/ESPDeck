'use client'

import Link from 'next/link'
import { DocShell } from '@/components/site/doc-shell'
import { useI18n } from '@/lib/i18n/provider'

export default function NotFound() {
  const { t } = useI18n()
  return (
    <DocShell>
      <article className="prose-lab">
        <p className="eyebrow">404</p>
        <h1>{t('notFound.title')}</h1>
        <p className="lead">{t('notFound.body')}</p>
        <p>
          <Link href="/" className="support-kofi inline-flex">
            {t('notFound.cta')}
          </Link>
        </p>
      </article>
    </DocShell>
  )
}
