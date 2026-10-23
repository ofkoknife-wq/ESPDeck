'use client'

import { Check, Copy, Eye, EyeOff, Play, Square } from 'lucide-react'
import { useState } from 'react'
import { runCodeTests } from '@/lib/code-tests'
import type { CodeChallenge } from '@/lib/advanced-types'
import type { Phase } from '@/lib/use-simulation'
import { cn } from '@/lib/utils'

export function CodeChallengePanel({
  challenge,
  code,
  onChange,
  phase,
  onRun,
  onStop,
}: {
  challenge: CodeChallenge
  code: string
  onChange: (value: string) => void
  phase: Phase
  onRun: () => void
  onStop: () => void
}) {
  const results = runCodeTests(code, challenge.tests)
  const busy = phase !== 'idle'
  const [showAnswer, setShowAnswer] = useState(false)
  const [copied, setCopied] = useState(false)

  const copySolution = async () => {
    try {
      await navigator.clipboard.writeText(challenge.solution)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* ignore */
    }
  }

  const fillSolution = () => {
    onChange(challenge.solution)
    setShowAnswer(true)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {challenge.holes.map((hole) => (
          <span key={hole.id} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium">
            {hole.hint}
          </span>
        ))}
      </div>
      <textarea
        value={code}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        className="min-h-40 flex-1 resize-none rounded-xl bg-[#020826] p-3 font-mono text-[12px] leading-5 text-[#fffffe] outline-none ring-primary/30 focus:ring-2"
        aria-label="代码挑战编辑器"
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={busy ? onStop : onRun}
            className={cn(
              'flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-bold',
              busy ? 'bg-foreground text-background' : 'bg-primary text-primary-foreground',
            )}
          >
            {busy ? <Square className="size-3.5 fill-current" /> : <Play className="size-3.5 fill-current" />}
            {busy ? '停止' : '运行仿真'}
          </button>
          <button
            type="button"
            onClick={() => setShowAnswer((value) => !value)}
            className="flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm font-bold hover:bg-secondary"
          >
            {showAnswer ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            {showAnswer ? '收起答案' : '显示答案'}
          </button>
        </div>
        <p className="font-mono text-xs">
          {results.filter((item) => item.ok).length}/{results.length} 项测试通过
        </p>
      </div>
      <ul className="space-y-1 text-xs">
        {results.map((item) => (
          <li key={item.name} className={item.ok ? 'text-emerald-700' : 'text-destructive'}>
            {item.ok ? '通过' : '未通过'} · {item.name}
          </li>
        ))}
      </ul>
      {showAnswer && (
        <div className="space-y-3 rounded-xl border bg-secondary/40 p-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">分步提示</p>
            <ol className="mt-2 space-y-2">
              {challenge.guide.map((step, index) => (
                <li key={step.title} className="text-sm">
                  <span className="font-bold">
                    {index + 1}. {step.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{step.body}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">参考答案</p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => void copySolution()}
                  className="flex h-7 items-center gap-1 rounded-md border bg-card px-2 text-[11px] font-bold hover:bg-muted"
                >
                  {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copied ? '已复制' : '复制代码'}
                </button>
                <button
                  type="button"
                  onClick={fillSolution}
                  className="flex h-7 items-center gap-1 rounded-md bg-foreground px-2 text-[11px] font-bold text-background"
                >
                  填入编辑器
                </button>
              </div>
            </div>
            <pre className="mt-2 max-h-56 overflow-auto rounded-lg bg-[#020826] p-3 font-mono text-[11px] leading-5 text-[#fffffe]">
              {challenge.solution}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
