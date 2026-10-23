import Link from 'next/link'
import { FOOTER_LINKS, SITE_NAME, SITE_TAGLINE } from '@/lib/site'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <nav aria-label="页脚导航" className="site-footer-nav">
        {FOOTER_LINKS.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <p>
        © {new Date().getFullYear()} {SITE_NAME} · {SITE_TAGLINE}
      </p>
    </footer>
  )
}
