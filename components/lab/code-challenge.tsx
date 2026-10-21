'use client'

import { Play, Square } from 'lucide-react'
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
    </div>
  )
}
