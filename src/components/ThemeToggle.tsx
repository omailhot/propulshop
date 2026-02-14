import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

import { THEME_STORAGE_KEY } from '@/config/theme'
import { m } from '@/paraglide/messages'

import { Button } from './ui/button'

type Theme = 'light' | 'dark'

const prefersDark = () =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const persisted = window.localStorage.getItem(THEME_STORAGE_KEY)
    const resolvedTheme =
      persisted === 'light' || persisted === 'dark'
        ? persisted
        : prefersDark()
          ? 'dark'
          : 'light'

    setTheme(resolvedTheme)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) {
      return
    }

    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light'
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  const label = theme === 'dark' ? m.theme_enable_light() : m.theme_enable_dark()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {mounted && theme === 'dark' ? (
        <Moon className="size-4" />
      ) : (
        <Sun className="size-4" />
      )}
    </Button>
  )
}
