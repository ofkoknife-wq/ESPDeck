'use client'

import Link from 'next/link'
import { getSupportCopy } from '@/lib/i18n/localize-info'
import { useI18n } from '@/lib/i18n/provider'
import { KO_FI_URL } from '@/lib/site'

export function SupportArticle() {
  const { locale } = useI18n()
  const copy = getSupportCopy(locale)

  return (
    <article className="prose-lab">
      <p className="support-back">
        <Link href="/">{copy.back}</Link>
      </p>
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1>{copy.title}</h1>

      <section>
        <h2>{copy.greetingTitle}</h2>
        <p>{copy.greetingP1}</p>
        <p>{copy.greetingP2}</p>
      </section>

      <section>
        <h2>{copy.waysTitle}</h2>
        <div className="support-ways">
          <div className="support-card">
            <h3>{copy.wechatTitle}</h3>
            <img className="support-qr" src="/donate.jpg" alt={copy.wechatAlt} width={280} height={280} />
            <p className="hint">{copy.wechatDesc}</p>
          </div>
          <div className="support-card support-card-muted">
            <h3>{copy.kofiTitle}</h3>
            <p className="hint">{copy.kofiDesc}</p>
            <a className="support-kofi" href={KO_FI_URL} target="_blank" rel="noopener noreferrer">
              {copy.kofiButton}
            </a>
          </div>
        </div>
      </section>

      <section>
        <h2>{copy.meaningTitle}</h2>
        <ul>
          <li>
            <strong>{copy.meaningDevTitle}</strong>
            {' — '}
            {copy.meaningDev}
          </li>
          <li>
            <strong>{copy.meaningHostTitle}</strong>
            {' — '}
            {copy.meaningHost}
          </li>
          <li>
            <strong>{copy.meaningThanksTitle}</strong>
            {' — '}
            {copy.meaningThanks}
          </li>
        </ul>
      </section>
      <p>{copy.closing}</p>
    </article>
  )
}
