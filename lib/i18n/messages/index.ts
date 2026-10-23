import { DEFAULT_LOCALE, type Locale } from '../config'
import { en, type MessageTree } from './en'
import { zhCN } from './zh-CN'

/** Register new UI catalogs here; incomplete locales fall back to en per-key. */
const TABLE: Partial<Record<Locale, MessageTree>> = {
  en,
  'zh-CN': zhCN,
  // ja / ko: add messages/ja.ts etc. when ready — until then per-key falls back to en
}

export type Messages = MessageTree

export function getMessages(locale: Locale): Messages {
  return TABLE[locale] ?? en
}

type Path = string

function lookup(messages: Messages, path: Path): string | undefined {
  const parts = path.split('.')
  let node: unknown = messages
  for (const part of parts) {
    if (!node || typeof node !== 'object') return undefined
    node = (node as Record<string, unknown>)[part]
  }
  return typeof node === 'string' ? node : undefined
}

function applyVars(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`))
}

/** Lookup path in locale pack, then en. Never return the raw path when en has the key. */
export function translate(messages: Messages, path: Path, vars?: Record<string, string | number>): string {
  const local = lookup(messages, path)
  if (local !== undefined) return applyVars(local, vars)
  if (messages !== en) {
    const fallback = lookup(en, path)
    if (fallback !== undefined) return applyVars(fallback, vars)
  }
  return path
}

export function translateLocale(locale: Locale, path: Path, vars?: Record<string, string | number>): string {
  return translate(getMessages(locale), path, vars)
}

export { DEFAULT_LOCALE }
