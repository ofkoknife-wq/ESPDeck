'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n/provider'
import { SITE_NAME } from '@/lib/site'

const LINKS = [
  { href: '/about', key: 'footer.about' },
  { href: '/guide', key: 'footer.guide' },
  { href: '/support', key: 'footer.support' },
  { href: '/terms', key: 'footer.terms' },
  { href: '/privacy', key: 'footer.privacy' },
] as const

export function SiteFooter() {
  const { t } = useI18n()
  return (
    <footer className="site-footer">
      <nav aria-label={t('footer.nav')} className="site-footer-nav">
        {LINKS.map((item) => (
          <Link key={item.href} href={item.href}>
            {t(item.key)}
          </Link>
        ))}
      </nav>
      <p>
        © {new Date().getFullYear()} {SITE_NAME} · {t('footer.tagline')}
      </p>
    </footer>
  )
}
