import Link from 'next/link'
import { DocShell } from '@/components/site/doc-shell'

export default function NotFound() {
  return (
    <DocShell>
      <article className="prose-lab">
        <p className="eyebrow">404</p>
        <h1>这一页还没有焊上</h1>
        <p className="lead">链接可能写错了，或者课程已经换了工位。回实验台从第一课再走一遍就好。</p>
        <p>
          <Link href="/" className="support-kofi inline-flex">
            回到实验台
          </Link>
        </p>
      </article>
    </DocShell>
  )
}
