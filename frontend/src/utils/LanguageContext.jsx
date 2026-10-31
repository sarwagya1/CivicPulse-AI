/**
 * LanguageContext.jsx
 * ===================
 * Provides a React Context for Hindi / English language switching
 * across the entire CivicPulse AI application.
 *
 * Usage:
 *   import { useLanguage } from '../utils/LanguageContext'
 *   const { lang, setLang, t } = useLanguage()
 */

import { createContext, useContext, useState, useCallback } from 'react'
import { translations } from './i18n'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem('civicpulse-lang') || 'en'
    } catch {
      return 'en'
    }
  })

  const setLang = useCallback((newLang) => {
    setLangState(newLang)
    try {
      localStorage.setItem('civicpulse-lang', newLang)
    } catch {
      // localStorage may not be available in some environments
    }
  }, [])

  /**
   * t(key) — Translate a dot-notation key, e.g. t('nav.home')
   * Falls back to English if Hindi key is missing, then to the raw key.
   */
  const t = useCallback((key) => {
    const dict = translations[lang] || translations['en']
    const keys = key.split('.')
    let val = dict
    for (const k of keys) {
      if (val == null) break
      val = val[k]
    }
    if (val != null && typeof val === 'string') return val
    // Fallback to English
    let fallback = translations['en']
    for (const k of keys) {
      if (fallback == null) break
      fallback = fallback[k]
    }
    return (fallback != null && typeof fallback === 'string') ? fallback : key
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
