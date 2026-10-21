import type { Metadata } from 'next'
import Link from 'next/link'
import { DocShell } from '@/components/site/doc-shell'
import { SUPPORT_COPY } from '@/lib/info-pages'
import { KO_FI_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: SUPPORT_COPY.seoTitle,
  description: SUPPORT_COPY.seoDescription,
}

export default function SupportPage() {
  return (
    <DocShell>
      <article className="prose-lab">
        <p className="support-back">
          <Link href="/">{SUPPORT_COPY.back}</Link>
        </p>
        <p className="eyebrow">请一杯咖啡</p>
        <h1>{SUPPORT_COPY.title}</h1>

        <section>
          <h2>{SUPPORT_COPY.greetingTitle}</h2>
          <p>{SUPPORT_COPY.greetingP1}</p>
          <p>{SUPPORT_COPY.greetingP2}</p>
        </section>

        <section>
          <h2>{SUPPORT_COPY.waysTitle}</h2>
          <div className="support-ways">
            <div className="support-card">
              <h3>{SUPPORT_COPY.wechatTitle}</h3>
              <img className="support-qr" src="/donate.jpg" alt="微信赞赏码" width={280} height={280} />
              <p className="hint">{SUPPORT_COPY.wechatDesc}</p>
            </div>
            <div className="support-card support-card-muted">
              <h3>{SUPPORT_COPY.kofiTitle}</h3>
              <p className="hint">{SUPPORT_COPY.kofiDesc}</p>
              <a className="support-kofi" href={KO_FI_URL} target="_blank" rel="noopener noreferrer">
                {SUPPORT_COPY.kofiButton}
              </a>
            </div>
          </div>
        </section>

        <section>
          <h2>{SUPPORT_COPY.meaningTitle}</h2>
          <ul>
            <li>
              <strong>{SUPPORT_COPY.meaningDevTitle}</strong>
              {' — '}
              {SUPPORT_COPY.meaningDev}
            </li>
            <li>
              <strong>{SUPPORT_COPY.meaningHostTitle}</strong>
              {' — '}
              {SUPPORT_COPY.meaningHost}
            </li>
            <li>
              <strong>{SUPPORT_COPY.meaningThanksTitle}</strong>
              {' — '}
              {SUPPORT_COPY.meaningThanks}
            </li>
          </ul>
        </section>
        <p>{SUPPORT_COPY.closing}</p>
      </article>
    </DocShell>
  )
}
