'use client'

import { BookOpen, Cpu } from 'lucide-react'
import { useEffect, useState } from 'react'

function Clock() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  if (!now) return <div className="h-10 w-36" aria-hidden="true" />
  const date = now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
  const time = now.toLocaleTimeString('zh-CN', { hour12: false })
  return (
    <div className="hidden flex-col items-end font-mono text-xs leading-relaxed text-muted-foreground tabular-nums sm:flex">
      <span>{date}</span>
      <span className="text-foreground">{time}</span>
    </div>
  )
}

export function Header({ done, total, advanced, onToggleAdvanced }: { done: number; total: number; advanced: boolean; onToggleAdvanced: () => void }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-[#e1e5eb] bg-white/95 px-4 py-3 shadow-[0_2px_14px_rgb(31_41_55/6%)] backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-[#f43f78] text-white shadow-[0_8px_18px_rgb(244_63_120/22%)]">
          <Cpu className="size-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-black tracking-tight text-[#1d1d1f] md:text-2xl">ESP32 实验室 <span className="font-mono text-xs font-normal tracking-normal text-[#2a2a2a]">/ 实验系统</span></h1>
          <p className="hidden whitespace-nowrap font-mono text-xs tracking-[0.3em] text-muted-foreground sm:block">
            认识 · 理解 · 动手
          </p>
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <button onClick={onToggleAdvanced} className="hidden rounded-xl border border-[#e1e5eb] bg-white px-3 py-2 text-xs font-bold text-[#020826] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#eaddcf] sm:block">
          {advanced ? '返回基础课' : '进入进阶工作台'}
        </button>
        <div className="flex items-center gap-2 rounded-xl border border-[#e1e5eb] bg-white px-2 py-1.5 shadow-sm sm:gap-3 sm:px-3 sm:py-2">
          <BookOpen className="size-4 text-foreground sm:size-5" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <span className="hidden text-xs font-bold sm:block">基础课程</span>
            <div className="flex items-center gap-2">
              <div
                className="h-1.5 w-20 overflow-hidden rounded-full bg-muted md:w-28"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={done}
                aria-label="课程进度"
              >
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${(done / total) * 100}%` }}
                />
              </div>
              <span className="font-mono text-xs font-bold tabular-nums">
                {done}/{total}
              </span>
            </div>
          </div>
        </div>
        <Clock />
      </div>
    </header>
  )
}
