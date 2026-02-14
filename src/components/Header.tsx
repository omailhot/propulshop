import { Link } from '@tanstack/react-router'
import { ShoppingBag } from 'lucide-react'

import { m } from '@/paraglide/messages'

import LocaleSwitcher from './LocaleSwitcher'
import ThemeToggle from './ThemeToggle'

type AppHeaderProps = {
  title?: string
  subtitle?: string
}

export default function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border border-orange-300/60 bg-[linear-gradient(90deg,#ffa000_20%,#ff4b00,#ff0035)] text-primary-foreground shadow-sm transition group-hover:scale-105">
            <ShoppingBag className="size-4" />
          </div>
          <div>
            <p className="font-semibold tracking-tight">{title ?? m.header_name()}</p>
            <p className="text-xs text-muted-foreground">
              {subtitle ?? m.header_subtitle()}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
