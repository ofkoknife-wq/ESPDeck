'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import type { Quiz } from '@/lib/advanced-types'
import { cn } from '@/lib/utils'

export function QuizPanel({ quiz, savedScore, onScored }: { quiz: Quiz; savedScore: number; onScored: (score: number) => void }) {
  const [picks, setPicks] = useState<number[]>(() => quiz.questions.map(() => -1))
  const [submitted, setSubmitted] = useState(savedScore > 0)
  const [reveal, setReveal] = useState(false)

  const score = picks.reduce((sum, pick, index) => sum + (pick === quiz.questions[index].answer ? 1 : 0), 0)
  const showKey = submitted || reveal

  return (
    <div className="flex flex-col gap-4">
      {quiz.questions.map((question, qi) => (
        <fieldset key={question.prompt}>
          <legend className="text-sm font-bold">
            {qi + 1}. {question.prompt}
          </legend>
          <div className="mt-2 grid gap-1.5">
            {question.choices.map((choice, ci) => (
              <label
                key={choice}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                  picks[qi] === ci && 'border-foreground bg-secondary',
                  showKey && ci === question.answer && 'border-emerald-600 bg-emerald-50',
                  submitted && picks[qi] === ci && ci !== question.answer && 'border-destructive',
                )}
              >
                <input
                  type="radio"
                  className="accent-foreground"
                  name={`q-${qi}`}
                  checked={picks[qi] === ci}
                  onChange={() => {
                    setSubmitted(false)
                    setPicks((prev) => prev.map((value, index) => (index === qi ? ci : value)))
                  }}
                />
                {choice}
                {showKey && ci === question.answer && (
                  <span className="ml-auto font-mono text-[10px] font-bold text-emerald-700">正确答案</span>
                )}
              </label>
            ))}
          </div>
          {showKey && <p className="mt-1 text-xs text-muted-foreground">{question.explain}</p>}
        </fieldset>
      ))}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setSubmitted(true)
            setReveal(false)
            onScored(score)
          }}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          提交测验
        </button>
        <button
          type="button"
          onClick={() => setReveal((value) => !value)}
          className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-bold hover:bg-secondary"
        >
          {reveal ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          {reveal ? '收起答案' : '显示答案'}
        </button>
      </div>
      {(submitted || savedScore > 0) && (
        <p className="text-sm font-bold">
          得分 {submitted ? score : savedScore} / {quiz.questions.length} · 及格线 {quiz.passScore}
        </p>
      )}
    </div>
  )
}
