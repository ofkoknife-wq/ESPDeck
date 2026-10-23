'use client'

import { ChevronLeft, ChevronRight, CircleCheck, Layers } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useI18n } from '@/lib/i18n/provider'
import type { Lesson, LessonId } from '@/lib/lessons'
import { cn } from '@/lib/utils'
import { LessonThumb } from './lesson-thumb'

type Props = {
  lessons: Lesson[]
  activeIndex: number
  completed: LessonId[]
  onSelect: (index: number) => void
  onOpenAdvanced?: () => void
}

export function LessonRail({ lessons, activeIndex, completed, onSelect, onOpenAdvanced }: Props) {
  const { t } = useI18n()
  const listRef = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const list = listRef.current
    const el = list?.children[activeIndex] as HTMLElement | undefined
    if (!list || !el) return
    list.scrollTo({ left: el.offsetLeft - list.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' })
  }, [activeIndex])

  return (
    <nav
      aria-label={t('lab.courseList')}
      className="lesson-rail flex min-h-0 flex-col gap-4 border-b border-border bg-card/70 px-4 py-4 lg:w-80 lg:shrink-0 lg:border-b-0 lg:border-r lg:px-8 lg:py-6"
    >
      <div className="grid grid-cols-[2rem_minmax(0,1fr)_2rem] items-center gap-2 text-center">
        <button
          onClick={() => onSelect(Math.max(0, activeIndex - 1))}
          disabled={activeIndex === 0}
          className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:-translate-y-0.5 hover:bg-secondary disabled:pointer-events-none disabled:opacity-30"
          aria-label={t('lab.prevLesson')}
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="min-w-0">
          <p className="eyebrow">{t('lab.learningPath')}</p>
          <h2 className="text-sm font-black tracking-widest">{t('lab.courseRoute')}</h2>
        </div>
        <button
          onClick={() => onSelect(Math.min(lessons.length - 1, activeIndex + 1))}
          disabled={activeIndex === lessons.length - 1}
          className="ml-auto flex size-8 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:-translate-y-0.5 hover:bg-secondary disabled:pointer-events-none disabled:opacity-30"
          aria-label={t('lab.nextLesson')}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <ol
        ref={listRef}
        className="scrollbar-none relative flex min-h-0 snap-x gap-2 overflow-x-auto pb-1 lg:flex-1 lg:flex-col lg:items-center lg:overflow-y-auto lg:overflow-x-hidden lg:pr-1"
      >
        {lessons.map((lesson, i) => {
          const active = i === activeIndex
          const done = completed.includes(lesson.id)
          return (
            <li key={lesson.id} className="snap-start">
              <button
                onClick={() => onSelect(i)}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'group flex h-16 w-[min(11rem,78vw)] items-center gap-3 rounded-lg border bg-card px-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm',
                  active && 'border-foreground ring-1 ring-foreground',
                )}
              >
                <LessonThumb
                  id={lesson.id}
                  className={cn(
                    'ring-1 ring-transparent transition',
                    active && 'ring-foreground shadow-sm',
                    done && !active && 'opacity-90',
                  )}
                />
                <span className="flex min-w-0 flex-col">
                  <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                    {t('lab.lessonN', { n: i + 1 })}
                    {done && <CircleCheck className="size-3.5 text-accent" aria-label={t('lab.done')} />}
                  </span>
                  <span className="truncate text-sm font-bold text-foreground">{lesson.title}</span>
                </span>
              </button>
            </li>
          )
        })}
        {onOpenAdvanced && (
          <li className="snap-start lg:mt-1 lg:w-full lg:max-w-[268px]">
            <button
              onClick={onOpenAdvanced}
              className="group flex h-16 w-[min(11rem,78vw)] items-center gap-3 rounded-lg border border-dashed border-foreground/40 bg-secondary/60 px-3 text-left transition-all hover:-translate-y-0.5 hover:border-foreground hover:bg-secondary lg:w-full"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
                <Layers className="size-5" aria-hidden="true" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="font-mono text-xs text-muted-foreground">{t('lab.nextUp')}</span>
                <span className="truncate text-sm font-bold text-foreground">{t('lab.advancedEntry')}</span>
              </span>
            </button>
          </li>
        )}
      </ol>
    </nav>
  )
}
