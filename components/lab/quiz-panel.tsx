'use client'

import { useState } from 'react'
import type { Quiz } from '@/lib/advanced-types'
import { cn } from '@/lib/utils'

export function QuizPanel({ quiz, savedScore, onScored }: { quiz: Quiz; savedScore: number; onScored: (score: number) => void }) {
  const [picks, setPicks] = useState<number[]>(() => quiz.questions.map(() => -1))
  const [submitted, setSubmitted] = useState(savedScore > 0)

  const score = picks.reduce((sum, pick, index) => sum + (pick === quiz.questions[index].answer ? 1 : 0), 0)

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
                  submitted && ci === question.answer && 'border-emerald-600 bg-emerald-50',
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
              </label>
            ))}
          </div>
          {submitted && <p className="mt-1 text-xs text-muted-foreground">{question.explain}</p>}
        </fieldset>
      ))}
      <button
        onClick={() => {
          setSubmitted(true)
          onScored(score)
        }}
        className="self-start rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
      >
        提交测验
      </button>
      {(submitted || savedScore > 0) && (
        <p className="text-sm font-bold">
          得分 {submitted ? score : savedScore} / {quiz.questions.length} · 及格线 {quiz.passScore}
        </p>
      )}
    </div>
  )
}
