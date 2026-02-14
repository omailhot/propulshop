import { PanelBottomOpen } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { MerchCopy } from '@/config/merch-copy'

type CartFooterBarProps = {
  t: MerchCopy
  itemCount: number
  subtotal: number
  formatCurrency: Intl.NumberFormat
  onOpen: () => void
}

export function CartFooterBar({
  t,
  itemCount,
  subtotal,
  formatCurrency,
  onOpen,
}: CartFooterBarProps) {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <Button className="w-full justify-between" onClick={onOpen}>
          <span className="inline-flex items-center gap-2">
            <PanelBottomOpen className="size-4" />
            {t.cartBuilder}
          </span>
          <span className="text-xs font-semibold sm:text-sm">
            {itemCount} {t.items} | {formatCurrency.format(subtotal)}
          </span>
        </Button>
      </div>
    </footer>
  )
}
