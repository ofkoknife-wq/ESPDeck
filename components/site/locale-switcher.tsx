'use client'

import { ChevronDown } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { LOCALE_META, type Locale } from '@/lib/i18n/config'
import { useI18n } from '@/lib/i18n/provider'
import { cn } from '@/lib/utils'

type MenuPos = { top: number; right: number; width: number }

export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [pos, setPos] = useState<MenuPos | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const listId = useId()
  const current = LOCALE_META.find((item) => item.code === locale) ?? LOCALE_META[0]

  useEffect(() => {
    setMounted(true)
  }, [])

  useLayoutEffect(() => {
    if (!open) return

    const update = () => {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return
      setPos({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
        width: Math.max(rect.width, 176),
      })
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
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

  const menu =
    mounted &&
    open &&
    pos &&
    createPortal(
      <ul
        ref={menuRef}
        id={listId}
        role="listbox"
        aria-label={t('header.language')}
        style={{ top: pos.top, right: pos.right, width: pos.width }}
        className="fixed z-[9999] max-h-56 overflow-y-auto overscroll-contain rounded-xl border border-[#e1e5eb] bg-white p-1 shadow-[0_16px_40px_rgb(31_41_55/18%)]"
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
                {!item.enabled && (
                  <span className="shrink-0 text-[10px] font-medium text-muted-foreground">{t('locale.soon')}</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>,
      document.body,
    )

  return (
    <div className={cn('relative', className)}>
      <button
        ref={buttonRef}
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
      {menu}
    </div>
  )
}
