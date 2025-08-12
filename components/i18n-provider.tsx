'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { dictionaries } from '@/lib/i18n'

export type Locale = 'en' | 'zh'
type Vars = Record<string, string | number>

type I18nContextType = {
  locale: Locale
  t: (key: string, vars?: Vars) => string
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)
const STORAGE_KEY = 'app_locale'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en') // default EN

  // Restore preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
      if (saved === 'en' || saved === 'zh') setLocale(saved)
    } catch {}
  }, [])

  // Persist preference
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, locale)
    } catch {}
  }, [locale])

  const t = useMemo(() => {
    return (key: string, vars?: Vars) => {
      const dict = dictionaries[locale] || dictionaries.en
      const parts = key.split('.')
      let node: any = dict
      for (const p of parts) {
        if (node && typeof node === 'object' && p in node) node = node[p]
        else return key
      }
      const text = typeof node === 'string' ? node : key
      if (!vars) return text
      return text.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`))
    }
  }, [locale])

  const value: I18nContextType = useMemo(
    () => ({
      locale,
      t,
      setLocale,
      toggleLocale: () => setLocale(prev => (prev === 'en' ? 'zh' : 'en')),
    }),
    [locale, t]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
