// Locale switcher refs:
// - Paraglide docs: https://inlang.com/m/gerre34r/library-inlang-paraglideJs
// - Router example: https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#switching-locale

import { getLocale, locales, setLocale } from '@/paraglide/runtime'

import { Button } from './ui/button'

export default function ParaglideLocaleSwitcher() {
  const currentLocale = getLocale()

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-full border bg-card/80 p-1">
        {locales.map((locale) => (
          <Button
            key={locale}
            onClick={() => setLocale(locale)}
            aria-pressed={locale === currentLocale}
            size="sm"
            variant={locale === currentLocale ? 'default' : 'ghost'}
            className="rounded-full px-3"
          >
            {locale.toUpperCase()}
          </Button>
        ))}
      </div>
    </div>
  )
}
