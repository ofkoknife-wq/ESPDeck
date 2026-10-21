'use client'

import { useCallback, useEffect, useState } from 'react'
import type { LessonId } from './lessons'

const KEY = 'esp32-lab:completed'

/** 学习进度只保存在本机浏览器，产品为纯前端。 */
export function useProgress() {
  const [completed, setCompleted] = useState<LessonId[]>([])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY)
      if (raw) setCompleted(JSON.parse(raw))
    } catch {}
  }, [])

  const markComplete = useCallback((id: LessonId) => {
    setCompleted((prev) => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  return { completed, markComplete }
}
