'use client'

import { Check, Coffee, Share2, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import { THANKS_EVENT } from '@/lib/thanks'

type Product = {
  name: string
  url: string
  cta: string
  badge: string
  tagline: string
  gradient: string
  border: string
}

const PRODUCTS: Product[] = [
  {
    name: 'PinyinDock',
    url: 'https://pinyindock.pixzens.com/',
    cta: '试试拼音坞',
    badge: '免费',
    tagline: '一篇课文，一键备齐注音阅读、听写与练习纸。',
    gradient: 'linear-gradient(135deg, #1d3557 0%, #457b9d 55%, #e63946 160%)',
    border: '#1d3557',
  },
  {
    name: 'Solfist',
    url: 'https://solfist.pixzens.com/',
    cta: '试试 Solfist',
    badge: '免费',
    tagline: '中小学视唱练耳备课台：能生成、能播、能印。',
    gradient: 'linear-gradient(135deg, #1c3a32 0%, #2f6b5a 55%, #c4a35a 160%)',
    border: '#163029',
  },
  {
    name: 'PaperMe',
    url: 'https://paperme.pixzens.com/',
    cta: '试试 PaperMe',
    badge: '免费',
    tagline: '自定义打印纸张模板，笔记、学习、创作都好用。',
    gradient: 'linear-gradient(135deg, #344F1F 0%, #5a7a3a 55%, #F4991A 160%)',
    border: '#2a4018',
  },
  {
    name: 'FolkStitch',
    url: 'https://folkstitch.pixzens.com/',
    cta: '试试 FolkStitch',
    badge: '免费',
    tagline: '照片一键变十字绣图纸，DMC 色号，本地处理不上传。',
    gradient: 'linear-gradient(135deg, #078080 0%, #0a9a9a 55%, #f45d48 160%)',
    border: '#067070',
  },
]

const COPY: Record<string, { title: string; body: string }> = {
  'first-run': {
    title: '程序已经跑起来了',
    body: '第一课能看见灯在闪，硬件就不那么吓人了。如果 ESPDeck 帮到你，欢迎请开发者喝杯咖啡，让实验室继续免费、继续拆课。',
  },
  'five-lessons': {
    title: '五节课，已经入门了',
    body: '按钮、灯、传感器——你已经把好几步踩实了。愿意的话，赞赏会变成下一课更清楚的台阶。',
  },
  'all-basic': {
    title: '零基础路线走完了',
    body: '三十课练下来不容易。若这间实验室陪你走过，欢迎打赏支持，或进进阶工位继续做项目。',
  },
  'first-quiz': {
    title: '测验过关了',
    body: '概念对上了，工位才算真的走完一圈。如果 ESPDeck 有用，欢迎赞赏支持个人开发者。',
  },
  default: {
    title: '这节课跑起来了',
    body: '如果 ESPDeck 让硬件不那么吓人，欢迎请开发者喝杯咖啡，让它继续免费、继续改。',
  },
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
  const product = useMemo(() => {
    if (!reason) return PRODUCTS[0]
    return PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)]
  }, [reason])
  const copy = COPY[reason ?? ''] ?? COPY.default

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
    const text = '推荐 ESPDeck —— 硬件看起来很吓人，直到你把它拆成小步骤。给新手练手的 ESP32 实验室。'
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
        <button type="button" className="thanks-close" onClick={onClose} aria-label="关闭">
          <X className="size-4" aria-hidden />
        </button>
        <div className="thanks-hero">
          <div className="thanks-logo-wrap">
            <Check className="size-5" strokeWidth={3} />
          </div>
          <h2 id="thanks-title">{copy.title}</h2>
          <p>{copy.body}</p>
        </div>
        <div className="thanks-actions">
          <Link href="/support" className="thanks-primary" onClick={onClose}>
            <Coffee aria-hidden className="size-4" />
            赞赏支持
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
                <span>{product.cta}</span>
                <span className="thanks-badge">{product.badge}</span>
              </span>
              <span className="thanks-tagline">{product.tagline}</span>
            </span>
            <span aria-hidden>→</span>
          </a>
          <button type="button" className="thanks-share" onClick={() => void share()}>
            <Share2 aria-hidden className="size-4" />
            分享实验室
          </button>
        </div>
        <button type="button" className="thanks-continue" onClick={onClose}>
          继续学习
        </button>
      </div>
    </div>
  )
}
