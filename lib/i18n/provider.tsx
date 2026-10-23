'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, resolveLocale, type Locale } from './config'
import { getMessages, translate, type Messages } from './messages'

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  messages: Messages
  t: (path: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)

  useEffect(() => {
    try {
      setLocaleState(resolveLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY)))
    } catch {
      setLocaleState(DEFAULT_LOCALE)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale === 'zh-CN' ? 'zh-CN' : locale
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    const resolved = resolveLocale(next)
    setLocaleState(resolved)
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, resolved)
    } catch {
      /* ignore */
    }
  }, [])

  const messages = useMemo(() => getMessages(locale), [locale])
  const t = useCallback((path: string, vars?: Record<string, string | number>) => translate(messages, path, vars), [messages])

  const value = useMemo(() => ({ locale, setLocale, messages, t }), [locale, setLocale, messages, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
