import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type ThemePreference = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  preference: ThemePreference
  effectiveTheme: 'light' | 'dark'
  setPreference: (pref: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'brujula-theme'

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
  })
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() =>
    preference === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : preference,
  )

  useEffect(() => {
    const resolved = preference === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : preference
    setEffectiveTheme(resolved)
    document.documentElement.setAttribute('data-theme', resolved)
  }, [preference])

  useEffect(() => {
    if (preference !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    function handleChange() {
      const resolved = media.matches ? 'dark' : 'light'
      setEffectiveTheme(resolved)
      document.documentElement.setAttribute('data-theme', resolved)
    }
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [preference])

  function setPreference(pref: ThemePreference) {
    setPreferenceState(pref)
    localStorage.setItem(STORAGE_KEY, pref)
  }

  return (
    <ThemeContext.Provider value={{ preference, effectiveTheme, setPreference }}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>')
  return ctx
}
