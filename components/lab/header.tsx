'use client'

import { BookOpen } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { LessonRecord } from '@/lib/advanced-types'
import { TRACKS, trackProgress } from '@/lib/curriculum'
import { LESSONS } from '@/lib/lessons'

export function Header({
  done,
  total,
  advanced,
  advancedRecords,
  onToggleAdvanced,
}: {
  done: number
  total: number
  advanced: boolean
  advancedRecords: Record<string, LessonRecord>
  onToggleAdvanced: () => void
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-[#e1e5eb] bg-white/95 px-4 py-3 shadow-[0_2px_14px_rgb(31_41_55/6%)] backdrop-blur lg:px-6">
      <Link href="/" className="flex min-w-0 items-center gap-3">
        <Image src="/logo.svg" alt="" width={40} height={40} className="size-10 rounded-2xl shadow-[0_8px_18px_rgb(244_63_120/18%)]" priority />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-black tracking-tight text-[#1d1d1f] md:text-2xl">
            ESP32 实验室 <span className="font-mono text-xs font-normal tracking-normal text-[#2a2a2a]">/ 实验系统</span>
          </h1>
          <p className="hidden whitespace-nowrap font-mono text-xs tracking-[0.3em] text-muted-foreground sm:block">
            零基础 · 能做项目 · 工程化 · 产品级
          </p>
        </div>
      </Link>
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <button
          onClick={onToggleAdvanced}
          className="rounded-xl border border-[#e1e5eb] bg-white px-2 py-2 text-[11px] font-bold text-[#020826] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#eaddcf] sm:px-3 sm:text-xs"
        >
          {advanced ? '返回零基础' : '进入进阶工作台'}
        </button>
        <div className="flex items-center gap-2 rounded-xl border border-[#e1e5eb] bg-white px-2 py-1.5 shadow-sm sm:gap-3 sm:px-3 sm:py-2">
          <BookOpen className="size-4 text-foreground sm:size-5" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <span className="hidden text-xs font-bold sm:block">{advanced ? '四段路线' : '基础课程'}</span>
            {advanced ? (
              <div className="flex gap-2">
                {TRACKS.map((track) => {
                  const progress = trackProgress(track.id, advancedRecords, done, total)
                  return (
                    <div key={track.id} className="hidden sm:block" title={track.title}>
                      <div className="h-1.5 w-10 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className="h-1.5 w-20 overflow-hidden rounded-full bg-muted md:w-28"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-valuenow={done}
                  aria-label="课程进度"
                >
                  <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${(done / total) * 100}%` }} />
                </div>
                <span className="font-mono text-xs font-bold tabular-nums">
                  {done}/{total}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
