'use client'

import { Palette } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '@/lib/i18n/provider'
import { THEME_META, type ThemeId } from '@/lib/theme/themes'
import { useTheme } from '@/lib/theme/provider'
import { cn } from '@/lib/utils'

const LABEL_KEY: Record<ThemeId, string> = {
  matcha: 'theme.matcha',
  umi: 'theme.umi',
  sakura: 'theme.sakura',
  sumi: 'theme.sumi',
  yuzu: 'theme.yuzu',
}

export function ThemeSwitcher({ className }: { className?: string }) {
  const { t } = useI18n()
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const update = () => {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return
      setPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right })
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

  const menu =
    mounted &&
    open &&
    pos &&
    createPortal(
      <div
        ref={menuRef}
        id={listId}
        role="listbox"
        aria-label={t('theme.title')}
        style={{ top: pos.top, right: pos.right }}
        className="fixed z-[9999] w-52 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-1.5 shadow-[var(--elevated-shadow)]"
      >
        {THEME_META.map((item) => {
          const selected = item.id === theme
          return (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => {
                setTheme(item.id)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition',
                selected ? 'bg-[color:var(--secondary)]' : 'hover:bg-[color:var(--muted)]',
              )}
            >
              <span className="flex shrink-0 gap-0.5" aria-hidden>
                {item.swatch.map((color) => (
                  <span key={color} className="size-3.5 rounded-full border border-black/5" style={{ background: color }} />
                ))}
              </span>
              <span className="min-w-0 flex-1 truncate text-[color:var(--foreground)]">{t(LABEL_KEY[item.id])}</span>
            </button>
          )
        })}
      </div>,
      document.body,
    )

  return (
    <div className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        className="ui-chip"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t('theme.title')}
        onClick={() => setOpen((value) => !value)}
      >
        <Palette className="size-3.5 opacity-70" aria-hidden />
        <span className="hidden sm:inline">{t(LABEL_KEY[theme])}</span>
      </button>
      {menu}
    </div>
  )
}
