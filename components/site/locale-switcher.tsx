'use client'

import { ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { LOCALE_META, type Locale } from '@/lib/i18n/config'
import { useI18n } from '@/lib/i18n/provider'
import { cn } from '@/lib/utils'

export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const current = LOCALE_META.find((item) => item.code === locale) ?? LOCALE_META[0]

  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pick = (code: Locale, enabled: boolean) => {
    if (!enabled) return
    setLocale(code)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className={cn('relative z-[110]', className)}>
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-xl border border-[#e1e5eb] bg-white px-2 py-2 text-[11px] font-bold text-[#020826] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#eaddcf] sm:px-3 sm:text-xs"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t('header.language')}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden className="text-sm leading-none">
          {current.flag}
        </span>
        <span className="hidden max-w-[4.5rem] truncate sm:inline">{current.nativeLabel}</span>
        <ChevronDown className={cn('size-3.5 opacity-60 transition', open && 'rotate-180')} aria-hidden />
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t('header.language')}
          className="absolute right-0 z-[120] mt-1.5 max-h-56 w-44 overflow-y-auto overscroll-contain rounded-xl border border-[#e1e5eb] bg-white p-1 shadow-[0_16px_40px_rgb(31_41_55/18%)]"
        >
          {LOCALE_META.map((item) => {
            const selected = item.code === locale
            return (
              <li key={item.code} role="option" aria-selected={selected} aria-disabled={!item.enabled}>
                <button
                  type="button"
                  disabled={!item.enabled}
                  onClick={() => pick(item.code, item.enabled)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-bold transition',
                    selected && 'bg-secondary',
                    item.enabled ? 'hover:bg-[#eaddcf]' : 'cursor-not-allowed opacity-45',
                  )}
                >
                  <span aria-hidden className="text-base leading-none">
                    {item.flag}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.nativeLabel}</span>
                  {!item.enabled && <span className="shrink-0 text-[10px] font-medium text-muted-foreground">{t('locale.soon')}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
