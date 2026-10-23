'use client'

import { useCallback, useEffect, useState } from 'react'
import type { LessonRecord } from './advanced-types'
import type { LessonId } from './lessons'
import { LESSONS } from './lessons'
import { celebrateThanks } from './thanks'

const BASIC_KEY = 'esp32-lab:completed'
const ADVANCED_KEY = 'esp32-lab:advanced'

const EMPTY_RECORD: LessonRecord = {
  ran: false,
  faultsSolved: [],
  challengeScore: 0,
  quizScore: 0,
  kitAck: false,
  rubricChecked: [],
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch {}
  return fallback
}

export function emptyLessonRecord(): LessonRecord {
  return { ...EMPTY_RECORD, faultsSolved: [], rubricChecked: [] }
}

export function useProgress() {
  const [completed, setCompleted] = useState<LessonId[]>([])
  const [advanced, setAdvanced] = useState<Record<string, LessonRecord>>({})

  useEffect(() => {
    setCompleted(readJson<LessonId[]>(BASIC_KEY, []))
    setAdvanced(readJson<Record<string, LessonRecord>>(ADVANCED_KEY, {}))
  }, [])

  const markComplete = useCallback((id: LessonId) => {
    setCompleted((prev) => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      try {
        window.localStorage.setItem(BASIC_KEY, JSON.stringify(next))
      } catch {}
      // 首课不弹；每完成 5 课弹一次（5 / 10 / 15 / 20 / 25 / 30）
      if (next.length > 0 && next.length % 5 === 0) {
        celebrateThanks(next.length === LESSONS.length ? 'all-basic' : `milestone-${next.length}`)
      }
      return next
    })
  }, [])

  const patchAdvanced = useCallback((id: string, patch: Partial<LessonRecord>) => {
    setAdvanced((prev) => {
      const current = prev[id] ?? emptyLessonRecord()
      const merged: LessonRecord = {
        ...current,
        ...patch,
        faultsSolved: patch.faultsSolved ?? current.faultsSolved,
        rubricChecked: patch.rubricChecked ?? current.rubricChecked,
      }
      if (
        current.ran === merged.ran &&
        current.challengeScore === merged.challengeScore &&
        current.quizScore === merged.quizScore &&
        current.kitAck === merged.kitAck &&
        current.faultsSolved.join() === merged.faultsSolved.join() &&
        current.rubricChecked.join() === merged.rubricChecked.join()
      ) {
        return prev
      }
      const next = { ...prev, [id]: merged }
      try {
        window.localStorage.setItem(ADVANCED_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const recordFor = useCallback(
    (id: string) => advanced[id] ?? emptyLessonRecord(),
    [advanced],
  )

  return { completed, markComplete, advanced, patchAdvanced, recordFor }
}
