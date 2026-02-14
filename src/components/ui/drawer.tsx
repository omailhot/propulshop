import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type DrawerProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Drawer({ open, onClose, title, children }: DrawerProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 transition',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
    >
      <button
        type="button"
        aria-label={title}
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-black/45 transition-opacity',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'absolute inset-x-0 bottom-0 max-h-[86vh] rounded-t-2xl border-t bg-background p-4 shadow-2xl transition-transform sm:p-6',
          open ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        {children}
      </section>
    </div>
  )
}

