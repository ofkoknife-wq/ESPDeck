'use client'

import { Check, Copy, Play, Square, Terminal, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { TOKEN_CLASS, tokenizeLine } from '@/lib/highlight'
import type { LogLine, Phase } from '@/lib/use-simulation'
import { cn } from '@/lib/utils'

type Props = {
  code: string
  phase: Phase
  logs: LogLine[]
  onRun: () => void
  onStop: () => void
  onCloseMonitor: () => void
}

const PHASE_LABEL: Record<Phase, string> = { idle: '已停止', uploading: '上传中', running: '运行中' }

export function CodePanel({ code, phase, logs, onRun, onStop, onCloseMonitor }: Props) {
  const [copied, setCopied] = useState(false)
  const lines = useMemo(() => code.split('\n').map(tokenizeLine), [code])
  const logRef = useRef<HTMLDivElement>(null)
  const showMonitor = phase !== 'idle' || logs.length > 0

  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [logs])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const busy = phase !== 'idle'

  return (
    <section aria-label="动手试试" className="flex min-w-0 min-h-0 w-full max-w-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
        <h2 className="text-sm font-bold">动手试试</h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={copy}
            className="flex size-8 items-center justify-center rounded-md border bg-background text-foreground transition-colors hover:bg-muted"
            aria-label={copied ? '已复制' : '复制代码'}
          >
            {copied ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
          </button>
          <button
            onClick={busy ? onStop : onRun}
            className={cn(
              'flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-bold transition-colors',
              busy
                ? 'bg-foreground text-background hover:bg-foreground/85'
                : 'bg-primary text-primary-foreground hover:bg-primary/90',
            )}
          >
            {busy ? (
              <Square className="size-3.5 fill-current" aria-hidden="true" />
            ) : (
              <Play className="size-3.5 fill-current" aria-hidden="true" />
            )}
            {busy ? '停止' : '运行'}
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <pre className="h-full overflow-auto py-3 font-mono text-[13px] leading-6">
          <code className="grid grid-cols-[auto_1fr]">
            {lines.map((tokens, i) => (
              <div key={i} className="contents">
                <span className="select-none pl-4 pr-4 text-right text-muted-foreground/60 tabular-nums">{i + 1}</span>
                <span className="whitespace-pre pr-4">
                  {tokens.map((t, j) => (
                    <span key={j} className={TOKEN_CLASS[t.kind]}>
                      {t.text}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </code>
        </pre>

        {showMonitor && (
          <div className="absolute inset-x-0 bottom-0 flex h-[55%] flex-col border-t bg-foreground text-background animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between px-3 py-1.5">
              <div className="flex items-center gap-2 font-mono text-xs">
                <Terminal className="size-3.5" aria-hidden="true" />
                <span className="font-bold">串口监视器</span>
                <span className="text-background/50">115200 baud</span>
                <span
                  className={cn(
                    'flex items-center gap-1 rounded px-1.5 py-0.5 font-bold',
                    phase === 'running' && 'bg-accent text-accent-foreground',
                    phase === 'uploading' && 'bg-primary text-primary-foreground',
                    phase === 'idle' && 'bg-background/15',
                  )}
                >
                  {phase !== 'idle' && <span className="size-1.5 animate-pulse rounded-full bg-current" />}
                  {PHASE_LABEL[phase]}
                </span>
              </div>
              <button
                onClick={onCloseMonitor}
                className="flex size-6 items-center justify-center rounded text-background/70 hover:bg-background/10 hover:text-background"
                aria-label="关闭串口监视器"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <div
              ref={logRef}
              className="min-h-0 flex-1 overflow-y-auto px-3 pb-2 font-mono text-xs leading-5"
              role="log"
              aria-live="polite"
            >
              {logs.map((l) => (
                <p
                  key={l.id}
                  className={cn(
                    'whitespace-pre-wrap',
                    l.tone === 'ok' && 'text-terminal-ok',
                    l.tone === 'warn' && 'text-terminal-warn',
                    l.tone === 'info' && 'text-background/60',
                  )}
                >
                  {l.text}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
