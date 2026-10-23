import type { Locale } from '../config'
import { en, type MessageTree } from './en'
import { zhCN } from './zh-CN'

const TABLE: Record<Locale, MessageTree> = {
  en,
  'zh-CN': zhCN,
  // Fall back to English until ja/ko packs ship
  ja: en,
  ko: en,
}

export type Messages = MessageTree

export function getMessages(locale: Locale): Messages {
  return TABLE[locale] ?? en
}

type Path = string

export function translate(messages: Messages, path: Path, vars?: Record<string, string | number>): string {
  const parts = path.split('.')
  let node: unknown = messages
  for (const part of parts) {
    if (!node || typeof node !== 'object') return path
    node = (node as Record<string, unknown>)[part]
  }
  if (typeof node !== 'string') return path
  if (!vars) return node
  return node.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`))
}
