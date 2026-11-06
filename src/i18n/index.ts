import { en } from './en'
import { id } from './id'
import type { TextKey } from './id'

export type Lang = 'id' | 'en'
export type { TextKey }

const dictionaries: Record<Lang, Partial<Record<TextKey, string>>> = { id, en }

let current: Lang = 'id'

export function setLang(lang: Lang): void {
  current = lang
}

export function t(key: TextKey, params?: Record<string, string | number>, lang: Lang = current): string {
  const raw = dictionaries[lang][key] ?? id[key]
  if (!params) return raw
  return raw.replace(/\{(\w+)\}/g, (_, name: string) => (name in params ? String(params[name]) : `{${name}}`))
}
