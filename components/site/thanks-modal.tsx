'use client'

import { Check, Coffee, Share2, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/lib/i18n/provider'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import { THANKS_EVENT } from '@/lib/thanks'

type ProductBase = {
  name: string
  url: string
  ctaKey: string
  tagKey: string
  gradient: string
  border: string
}

const PRODUCTS: ProductBase[] = [
  {
    name: 'PinyinDock',
    url: 'https://pinyindock.pixzens.com/',
    ctaKey: 'thanks.tryPinyin',
    tagKey: 'thanks.pinyinTag',
    gradient: 'linear-gradient(135deg, #1d3557 0%, #457b9d 55%, #e63946 160%)',
    border: '#1d3557',
  },
  {
    name: 'Solfist',
    url: 'https://solfist.pixzens.com/',
    ctaKey: 'thanks.trySolfist',
    tagKey: 'thanks.solfistTag',
    gradient: 'linear-gradient(135deg, #1c3a32 0%, #2f6b5a 55%, #c4a35a 160%)',
    border: '#163029',
  },
  {
    name: 'PaperMe',
    url: 'https://paperme.pixzens.com/',
    ctaKey: 'thanks.tryPaperMe',
    tagKey: 'thanks.papermeTag',
    gradient: 'linear-gradient(135deg, #344F1F 0%, #5a7a3a 55%, #F4991A 160%)',
    border: '#2a4018',
  },
  {
    name: 'FolkStitch',
    url: 'https://folkstitch.pixzens.com/',
    ctaKey: 'thanks.tryFolkStitch',
    tagKey: 'thanks.folkTag',
    gradient: 'linear-gradient(135deg, #078080 0%, #0a9a9a 55%, #f45d48 160%)',
    border: '#067070',
  },
]

const REASON_KEYS: Record<string, { title: string; body: string }> = {
  'milestone-5': { title: 'thanks.m5Title', body: 'thanks.m5Body' },
  'milestone-10': { title: 'thanks.m10Title', body: 'thanks.m10Body' },
  'milestone-15': { title: 'thanks.m15Title', body: 'thanks.m15Body' },
  'milestone-20': { title: 'thanks.m20Title', body: 'thanks.m20Body' },
  'milestone-25': { title: 'thanks.m25Title', body: 'thanks.m25Body' },
  'all-basic': { title: 'thanks.allTitle', body: 'thanks.allBody' },
  default: { title: 'thanks.defaultTitle', body: 'thanks.defaultBody' },
}

export function ThanksHost() {
  const [reason, setReason] = useState<string | null>(null)

  useEffect(() => {
    const show = (event: Event) => {
      const detail = (event as CustomEvent<{ reason?: string }>).detail
      setReason(detail?.reason ?? 'default')
    }
    window.addEventListener(THANKS_EVENT, show)
    return () => window.removeEventListener(THANKS_EVENT, show)
  }, [])

  return <ThanksModal reason={reason} onClose={() => setReason(null)} />
}

function ThanksModal({ reason, onClose }: { reason: string | null; onClose: () => void }) {
  const { t } = useI18n()
  const product = useMemo(() => {
    if (!reason) return PRODUCTS[0]
    return PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)]
  }, [reason])
  const keys = REASON_KEYS[reason ?? ''] ?? REASON_KEYS.default

  useEffect(() => {
    if (!reason) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [reason, onClose])

  if (!reason) return null

  const share = async () => {
    const text = t('thanks.shareText', { tagline: t('footer.tagline') })
    try {
      if (navigator.share) {
        await navigator.share({ title: SITE_NAME, text, url: SITE_URL })
        return
      }
      await navigator.clipboard.writeText(SITE_URL)
    } catch {
      try {
        await navigator.clipboard.writeText(SITE_URL)
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <div className="thanks-backdrop" role="presentation" onClick={onClose}>
      <div
        className="thanks-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="thanks-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="thanks-close" onClick={onClose} aria-label={t('thanks.close')}>
          <X className="size-4" aria-hidden />
        </button>
        <div className="thanks-hero">
          <div className="thanks-logo-wrap">
            <Check className="size-5" strokeWidth={3} />
          </div>
          <h2 id="thanks-title">{t(keys.title)}</h2>
          <p>{t(keys.body)}</p>
        </div>
        <div className="thanks-actions">
          <Link href="/support" className="thanks-primary" onClick={onClose}>
            <Coffee aria-hidden className="size-4" />
            {t('thanks.support')}
          </Link>
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="thanks-product"
            style={{ background: product.gradient, borderColor: product.border }}
            onClick={onClose}
          >
            <span className="thanks-product-text">
              <span className="thanks-product-row">
                <span>{t(product.ctaKey)}</span>
                <span className="thanks-badge">{t('thanks.free')}</span>
              </span>
              <span className="thanks-tagline">{t(product.tagKey)}</span>
            </span>
            <span aria-hidden>→</span>
          </a>
          <button type="button" className="thanks-share" onClick={() => void share()}>
            <Share2 aria-hidden className="size-4" />
            {t('thanks.share')}
          </button>
        </div>
        <button type="button" className="thanks-continue" onClick={onClose}>
          {t('thanks.continue')}
        </button>
      </div>
    </div>
  )
}
